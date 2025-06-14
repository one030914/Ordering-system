"use client";

import { useEffect, useState } from "react";
import { useMqttClient } from "@/hooks/useMqttClient";
import { editOrderStatus, getPendingOrders } from "@/app/actions/order";
import { addNotification } from "@/app/actions/notification";

export default function PendingOrdersPage() {
    const [orders, setOrders] = useState([]);
    // 顧客下單的
    const [topics, setTopics] = useState([]);

    const { messages, publishMessage } = useMqttClient({
        subscribeTopics: topics ? topics : [],
    });

    useEffect(() => {
        // 設定 MQTT 主題
        const newTopics = [
            getOrderCheckoutTopic(),
            getCustomerCancelOrderTopic("#"),
        ];
        setTopics(newTopics);

        const getOrders = async () => {
            try {
                // action
                let data = await getPendingOrders();
                if (!data) {
                    const response = await fetch(`/api/orders/pending`);
                    if (!response.ok) {
                        alert("獲取待處理訂單失敗");
                        return;
                    }
                    data = await response.json();
                }
                setOrders(data);
            } catch (err) {
                alert("獲取待處理訂單失敗");
            }
        };
        getOrders();
    }, []);

    // 當收到 MQTT 訊息時，更新訂單狀態
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        // 檢查是否為結帳訊息
        const isCheckoutOrder = lastMessage.topic.includes("checkout");
        // 檢查是否為取消訂單的訊息
        const isCancelOrder = lastMessage.topic.includes("cancel");

        if (isCheckoutOrder) {
            try {
                const newOrder = JSON.parse(lastMessage.payload);
                setOrders((prev) => {
                    // 檢查是否已存在相同 ID 的訂單
                    const exists = prev.some(
                        (order) => order.id === newOrder.id
                    );
                    return exists ? prev : [newOrder, ...prev];
                });
            } catch (err) {
                console.error("無法解析 MQTT 訊息:", err);
            }
        }
        if (isCancelOrder) {
            try {
                const payload = JSON.parse(lastMessage.payload);
                const orderId = payload.orderId;
                setOrders((prev) =>
                    prev.filter((order) => order.id !== orderId)
                );
            } catch (err) {
                console.error("無法解析取消訂單的 MQTT 訊息:", err);
            }
        }
    }, [messages]);

    const handleAcceptOrder = async (orderId) => {
        try {
            let response;
            // action
            let data = await editOrderStatus({ status: "PREPARING" }, orderId);

            if (!data) {
                // api
                response = await fetch(`/api/orders/${orderId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "PREPARING" }),
                });
                if (!response.ok) {
                    alert("修改訂單狀態失敗");
                    return;
                }
            }
            setOrders((prev) => prev.filter((order) => order.id !== orderId));

            // 傳送通知
            const customerId = orders.find(
                (order) => order.id === orderId
            ).customerId;

            // action
            let notificationRes = await addNotification(
                {
                    orderId,
                    message: `訂單 ${orderId.slice(0, 8)} 正在製作中`,
                },
                customerId
            );
            if (!notificationRes) {
                // api
                response = await fetch(
                    `/api/notifications/users/${customerId}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId,
                            message: `訂單 ${orderId.slice(0, 8)} 正在製作中`,
                        }),
                    }
                );
                if (!response.ok) {
                    alert("傳送通知失敗");
                    return;
                }
                notificationRes = await response.json();
            }

            // 接受訂單，傳送通知給使用者
            const topic = ""; // TODO: 設定 MQTT 主題
            if (notificationRes && notificationRes.id) {
                // TODO: 準備 MQTT 訊息內容
                // TODO: 發布 MQTT 訊息(通知)
            }

            // 發布訂單資料到廚房
            const kitchenTopic = ""; // TODO: 設定廚房 MQTT 主題

            // TODO: 準備廚房訂單資料

            // TODO: 發布廚房訂單資料到 MQTT

            if (!response.ok) {
                alert("傳送通知失敗");
                return;
            }
        } catch (error) {
            console.error("Failed to update order status:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center sm:text-left text-gray-800">
                    待處理訂單
                </h1>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center sm:text-left">
                        目前沒有待處理訂單。
                    </p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, idx) => (
                            <div
                                key={`${order.id}-${idx}`}
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
                                    <div></div>
                                </div>

                                <div className="mb-3 space-y-1">
                                    <p className="text-gray-700">
                                        <strong>總金額：</strong> $
                                        {order.totalAmount.toFixed(2)}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>顧客：</strong>{" "}
                                        {order.customer.name}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-700">
                                        餐點內容：
                                    </h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <li
                                                key={`${item.id}-${idx}`}
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

                                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                    {order.status === "PENDING" && (
                                        <button
                                            onClick={() =>
                                                handleAcceptOrder(order.id)
                                            }
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                        >
                                            接受訂單
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
