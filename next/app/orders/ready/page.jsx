"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useUser from "@/hooks/useUser";
import { useMqttClient } from "@/hooks/useMqttClient";
import { editOrderStatus, getOrderById, getReadyOrders } from "@/app/actions/order";
import { getKitchenReadyOrderTopic, getStaffCompletedOrderTopic } from "@/utils/mqttTopic";

export default function ReadyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: userLoading } = useUser();
    const [topic, setTopic] = useState("");

    const { messages, publishMessage } = useMqttClient({
        subscribeTopics: topic ? [topic] : [],
    });

    useEffect(() => {
        if (userLoading) {
            return;
        }
        setTopic(getKitchenReadyOrderTopic("#"));

        const getOrders = async () => {
            try {
                // action
                let data = await getReadyOrders();
                if (!data) {
                    // api
                    const response = await fetch(`/api/orders/ready`);
                    if (!response.ok) {
                        alert("獲取完成訂單失敗");
                        return;
                    }
                    data = await response.json();
                }
                setOrders(data);
                setLoading(false);
            } catch (err) {
                alert("獲取完成訂單失敗");
            }
        };
        getOrders();
    }, [userLoading]);

    // 當接收到 MQTT 訊息時，更新訂單列表
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        try {
            const newOrder = JSON.parse(lastMessage.payload);

            setOrders((prev) => {
                // 檢查是否已存在相同 ID 的訂單
                const exists = prev.some((order) => order.id === newOrder.id);
                return exists
                    ? prev
                    : [
                          ...prev,
                          {
                              ...newOrder,
                              id: newOrder.orderId || newOrder.id,
                          },
                      ];
            });
        } catch (err) {
            console.error("無法解析 MQTT 訊息:", err);
        }
    }, [messages]);

    const handleCompleteButton = async (orderId) => {
        let data = await editOrderStatus({ status: "COMPLETED" }, orderId);
        if (!data) {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "COMPLETED" }),
            });
            if (!response.ok) {
                alert("修改訂單狀態失敗");
                return;
            }
        }

        setOrders(orders.filter((o) => o.id !== orderId));
        // action
        let orderData = await getOrderById(orderId);
        if (!orderData) {
            // api
            const orderRes = await fetch(`/api/orders/${orderId}`);
            if (!orderRes.ok) {
                alert("獲取訂單詳情失敗");
                return;
            }
            orderData = await orderRes.json();
        }

        // 取出訂單的顧客 ID
        const customerId = orderData.customer?.id;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50 py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">🍱 完成的訂單</h1>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse h-24 bg-white rounded-lg shadow"
                            />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20 text-lg">
                        🎉 目前沒有完成的訂單
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                layout
                                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl font-bold text-pink-600 mb-2">
                                    訂單 #{order.id.slice(0, 8)}
                                </h2>
                                <p className="text-gray-800 font-medium mb-1">
                                    顧客：{order.customer?.name}
                                </p>
                                <ul className="text-sm list-disc pl-5 mb-2 space-y-1">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.menuItem.name}

                                            <p className="text-xs text-gray-500 ml-4">
                                                備註：{item.specialRequest}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                <p className="text-xs text-gray-500">
                                    訂單建立時間：{order.createdAt}
                                </p>
                                <button
                                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-semibold transition"
                                    onClick={() => {
                                        handleCompleteButton(order.orderId || order.id);
                                    }}
                                >
                                    ✅ 已交付
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
