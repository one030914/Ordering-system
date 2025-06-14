"use client";

import { motion } from "framer-motion";
import useNotifications from "@/hooks/useNotifications";

export default function NotifyPage() {
    const { notifications, loading } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case "order":
                return "🍱";
            case "promotion":
                return "🎉";
            case "account":
                return "🔐";
            default:
                return "📩";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-rose-100 to-pink-200 py-10 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">🔔 通知中心</h1>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-white rounded-lg shadow animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-600 mt-10">目前沒有任何通知。</div>
                ) : (
                    <motion.div layout className="space-y-4">
                        {notifications.map((note) => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-md p-5 flex items-start gap-4"
                            >
                                <div className="text-3xl">{getIcon(note.type)}</div>
                                <div>
                                    <h2 className="font-semibold text-gray-800 mb-1">{note.title}</h2>
                                    <p className="text-sm text-gray-600 mb-1">{note.content}</p>
                                    <p className="text-xs text-gray-400">{note.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
