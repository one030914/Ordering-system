"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            setError("所有欄位皆為必填");
            return;
        }

        if (password !== confirmPassword) {
            setError("密碼不一致");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "註冊失敗");

            router.push("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-300 to-pink-400 px-4">
            <div className="max-w-md w-full bg-white/30 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8 transition-all">
                <h2 className="text-3xl font-extrabold text-center text-gray-700 drop-shadow mb-6">
                    註冊帳號
                </h2>

                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center font-medium bg-red-100 p-2 rounded-md shadow-sm">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputField
                        label="姓名"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <InputField
                        label="電子信箱"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <InputField
                        label="密碼"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <InputField
                        label="確認密碼"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 drop-shadow-md"
                    >
                        {isSubmitting ? "註冊中..." : "建立帳號"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-700">
                    已有帳號？{" "}
                    <Link href="/login" className="text-blue-700 underline font-semibold hover:text-gray-200">
                        前往登入
                    </Link>
                </p>
            </div>
        </div>
    );
}

function InputField({ label, name, type, value, onChange }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold text-gray-800 mb-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white/80 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
        </div>
    );
}
