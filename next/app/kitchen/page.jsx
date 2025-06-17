"use client";

import { useEffect, useState } from "react";
import { useMqttClient } from "@/hooks/useMqttClient";
import { editOrderStatus, getKitchenOrders } from "@/app/actions/order";
import { addNotification } from "@/app/actions/notification";
import { getKitchenOrderTopic } from "@/utils/mqttTopic";

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);
    const [topic, setTopic] = useState("");

    const { messages, publishMessage } = useMqttClient({
        subscribeTopics: topic ? [topic] : [],
    });

    useEffect(() => {
        setTopic(getKitchenOrderTopic());

        const fetchOrders = async () => {
            try {
                let data = await getKitchenOrders();
                if (!data) {
                    const response = await fetch("/api/orders/kitchen");
                    if (!response.ok) {
                        alert("取得廚房訂單失敗");
                        return;
                    }
                    data = await response.json();
                }

                setOrders(data);
            } catch (err) {
                alert("取得廚房訂單失敗");
            }
        };
        fetchOrders();
    }, []);

    // 當收到新的 MQTT 訊息時更新訂單
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        try {
            const newOrder = JSON.parse(lastMessage.payload);

            setOrders((prev) => {
                // 檢查是否存在相同 ID 的訂單
                const exists = prev.some((order) => order.id === newOrder.id);
                return exists ? prev : [...prev, newOrder];
            });
        } catch (err) {
            console.error("無法解析 MQTT 訊息:", err);
        }
    }, [messages]);

    const handleCompleteOrder = async (orderId) => {
        try {
            // action
            let data = await editOrderStatus(
                {
                    status: "READY",
                },
                orderId
            );
            let response;
            if (!data) {
                // api
                response = await fetch(`/api/orders/${orderId}/status`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: "READY",
                    }),
                });
                if (!response.ok) {
                    alert("完成訂單失敗");
                    return;
                }
            }

            setOrders((prev) => prev.filter((order) => order.id !== orderId));

            // 傳送通知
            const customerId = orders.find((order) => order.id === orderId).customerId;

            let notificationRes = await addNotification(
                {
                    orderId,
                    message: `可領取訂單 ${orderId.slice(0, 8)}`,
                },
                customerId
            );
            if (!notificationRes) {
                response = await fetch(`/api/notifications`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: customerId,
                        orderId,
                        message: `可領取訂單 ${orderId.slice(0, 8)}`,
                    }),
                });
                if (!response.ok) {
                    alert("傳送通知失敗");
                    return;
                }
                notificationRes = await response.json();
            }

            const readyNotificationTopic = ""; // TODO: 設定 MQTT 主題

            // 準備發布 MQTT 訊息
            if (notificationRes && notificationRes.id) {
                // TODO: 準備要發布的 MQTT 訊息
                // TODO: 發布 MQTT 訊息
            }
        } catch (error) {
            console.error("完成訂單失敗:", error);
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-800">👨‍🍳 廚房訂單看板</h1>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500 mt-12 text-lg">暫無待處理訂單 🍳</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order, idx) => (
                        <div
                            key={`${order.id}-${idx}`}
                            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 p-6 border border-gray-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        訂單 #{order.id.slice(0, 8)}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {/* <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                    {order.status}
                                </span> */}
                            </div>
                            <div className="border-t pt-4">
                                <ul className="space-y-2 text-sm">
                                    {order.items.map((item, idx) => (
                                        <li key={`${item.id}-${idx}`}>
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium">
                                                    {item.menuItem.name} × {item.quantity}
                                                </span>
                                            </div>
                                            {item.specialRequest && (
                                                <div className="mt-1 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                                    <strong>備註：</strong> {item.specialRequest}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleCompleteOrder(order.orderId || order.id)}
                                className="mt-5 w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                ✅ 標記為已完成
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
