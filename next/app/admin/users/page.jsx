"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const roleLabels = {
        CUSTOMER: "顧客",
        STAFF: "員工",
        CHEF: "廚師",
        OWNER: "老闆",
    };

    useEffect(() => {
        const getUsers = async () => {
            const response = await fetch("/api/users");
            if (!response.ok) {
                alert("獲取使用者失敗");
            }
            const data = await response.json();
            const formedData = data.map((item) => {
                return {
                    id: item.id,
                    email: item.email,
                    role: item.role,
                    name: item.name,
                    createdAt: new Date(item.createdAt).toLocaleString("sv"),
                };
            });
            setUsers(formedData);
            setLoading(false);
        };
        getUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        const response = await fetch(`/api/users/${userId}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
        });
        if (!response.ok) {
            alert("更改使用者權限失敗");
            return;
        }
    };

    const filteredUsers = users.filter((u) =>
        `${u.name}${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    👥 使用者管理
                </h1>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜尋名稱或 Email..."
                    className="w-full mb-6 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-400"
                />

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse h-20 bg-white rounded-lg shadow"
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredUsers.map((user) => (
                            <motion.div
                                layout
                                key={user.id}
                                className="bg-white rounded-xl shadow-lg p-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    {user.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {user.email}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                    建立時間：
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString()}
                                </p>

                                <label className="text-sm font-medium text-gray-700">
                                    切換角色
                                </label>
                                <select
                                    value={user.role}
                                    onChange={(e) =>
                                        handleRoleChange(
                                            user.id,
                                            e.target.value
                                        )
                                    }
                                    className="block w-full mt-1 mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-pink-400"
                                    disabled={user.role === "OWNER"}
                                >
                                    <option value={user.role}>
                                        {roleLabels[user.role] || user.role}
                                    </option>
                                    {Object.entries(roleLabels)
                                        .filter(
                                            ([key]) =>
                                                key !== "OWNER" &&
                                                key !== user.role
                                        )
                                        .map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                </select>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
