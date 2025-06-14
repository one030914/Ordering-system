"use client";

import { useEffect, useState } from "react";
import { useMqttClient } from "@/hooks/useMqttClient";
import useUser from "@/hooks/useUser";
import { editOrderStatus, getCustomerOrder } from "@/app/actions/order";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [topic, setTopic] = useState("");
    const { user, loading } = useUser();

    const { messages, publishMessage } = useMqttClient({
        subscribeTopics: topic ? [topic] : [],
    });

    useEffect(() => {
        if (loading) {
            return;
        }
        setTopic(getKitchenReadyOrderTopic("#"));

        const getOrders = async () => {
            try {
                // action
                let data = await getCustomerOrder(user.id);
                if (!data) {
                    // api
                    const response = await fetch(
                        `/api/orders/customers/${user.id}`
                    );
                    data = await response.json();
                }
                setOrders(data);
            } catch (err) {
                alert("獲取顧客訂單失敗");
            }
        };
        getOrders();
    }, [loading]);

    // 當收到 MQTT 訊息時，更新訂單狀態
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        const payload = JSON.parse(lastMessage.payload);

        const status = payload.status;
        const orderId = payload.orderId;

        setOrders((prev) => {
            return prev.map((order) =>
                order.id === orderId ? { ...order, status } : order
            );
        });
    }, [messages]);

    const getStatusText = (status) => {
        switch (status) {
            case "PENDING":
                return "店家未接單";
            case "PREPARING":
                return "餐點準備中";
            case "READY":
                return "餐點可領取";
            case "COMPLETED":
                return "交易完成";
            case "CANCELLED":
                return "交易取消";
            default:
                return "錯誤...";
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "PREPARING":
                return "bg-blue-100 text-blue-800";
            case "READY":
                return "bg-green-100 text-green-800";
            case "COMPLETED":
                return "bg-gray-100 text-gray-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const handleCancelOrderButton = async (orderId) => {
        try {
            // action
            let data = await editOrderStatus(
                {
                    status: "CANCELLED",
                },
                orderId
            );
            if (!data) {
                // api
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: "CANCELLED",
                    }),
                });
                if (!response.ok) {
                    alert("訂單取消失敗");
                    return;
                }
            }
            setOrders((prev) =>
                prev.map((order) =>
                    order.id !== orderId
                        ? order
                        : { ...order, status: "CANCELLED" }
                )
            );

            // 發布訂單取消的 MQTT 訊息
            const topic = ""; // TODO: 設定 MQTT 主題
            // TODO: 準備訊息內容

            // TODO: 發布 MQTT 訊息
        } catch (error) {
            alert("訂單取消失敗");
        }
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center sm:text-left text-gray-800">
                    我的訂單
                </h1>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center sm:text-left">
                        您目前沒有任何訂單。
                    </p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            訂單 #{order.id.slice(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`mt-2 sm:mt-0 px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusText(order.status)}
                                    </span>
                                </div>

                                <div className="mb-3 space-y-1">
                                    <p className="text-gray-700">
                                        <strong>總金額：</strong> $
                                        {order.totalAmount.toFixed(2)}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-700">
                                        餐點內容：
                                    </h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-between text-sm text-gray-600"
                                            >
                                                <span>
                                                    {item.menuItem.name} ×{" "}
                                                    {item.quantity}
                                                    {item.specialRequest && (
                                                        <span className="block text-xs text-gray-400">
                                                            備註：
                                                            {
                                                                item.specialRequest
                                                            }
                                                        </span>
                                                    )}
                                                </span>
                                                <span>
                                                    $
                                                    {(
                                                        item.menuItem.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {order.status === "PENDING" && (
                                    <div className="mt-4 text-center sm:text-right">
                                        <button
                                            onClick={() => {
                                                handleCancelOrderButton(
                                                    order.id
                                                );
                                            }}
                                            className="inline-block bg-gradient-to-r from-red-400 to-red-600 text-white px-5 py-2 rounded-md hover:opacity-90 transition"
                                        >
                                            取消訂單
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
