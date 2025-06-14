"use client";

import { useEffect, useState } from "react";
import useUser from "./useUser";
import { useMqttClient } from "@/hooks/useMqttClient";
import { getUserNotification } from "@/app/actions/notification";
import { getOrderStatusWildcardTopic } from "@/utils/mqttTopic";

export default function useNotifications() {
    const { user, loading: userLoading } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState("");

    const { messages } = useMqttClient({
        subscribeTopics: topic ? [topic] : [],
    });

    // 初始載入通知
    useEffect(() => {
        if (userLoading || !user.id) {
            return;
        }

        setTopic(getOrderStatusWildcardTopic(user.id));

        const timeout = setTimeout(async () => {
            const userId = user.id;
            if (!userId) {
                return;
            }
            // action
            let data = await getUserNotification(userId);
            if (!data) {
                // api
                const response = await fetch(
                    `/api/notifications/users/${userId}`
                );
                if (!response.ok) {
                    console.error("取得使用者通知失敗");
                    return;
                }
                data = await response.json();
            }
            const formedData = data.map((item) => {
                return {
                    id: item.id,
                    title: "訂單",
                    type: "order",
                    content: item.message,
                    read: item.isRead,
                    time: new Date(item.createdAt).toLocaleString("sv"),
                };
            });
            setNotifications(formedData);
            setUnreadCount(formedData.filter((n) => !n.read).length);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [user, userLoading]);

    // 當收到新的 MQTT 訊息時更新通知
    useEffect(() => {
        if (messages.length === 0) {
            return;
        }
        try {
            const lastMessage = messages[messages.length - 1];
            const newOrder = JSON.parse(lastMessage.payload);

            setNotifications((prev) => {
                return [newOrder, ...prev];
            });
            setUnreadCount((prev) => prev + 1);
        } catch (err) {
            console.error("無法解析 MQTT 訊息:", err);
        }
    }, [messages]);

    const notificationSetter = (notifications) => {
        setNotifications(notifications);
        const unreadCount = notifications.filter(
            (n) => n.read === false
        ).length;
        setUnreadCount(unreadCount);
    };

    return {
        notifications,
        setNotifications: notificationSetter,
        unreadCount,
        loading,
    };
}
