"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import NotifyButton from "@/app/components/notifyButton";
import useUser from "@/hooks/useUser";

export default function Navbar() {
    const { user, setUser } = useUser();
    const { data: session, status } = useSession(); // status: "loading" | "authenticated" | "unauthenticated"
    const [isLogin, setIsLogin] = useState(
        session?.user?.provider === "google" ||
        session?.user?.provider === "github"
    );

    useEffect(() => {
        const pathname = window.location.pathname;
        if (pathname.startsWith("/login") && !!sessionStorage.getItem("user")) {
            window.location.href = "/";
            return;
        }
        if (status === "authenticated" && session?.user) {
            setUser(session.user);
            setIsLogin(true);
        } else {
            const localUser = sessionStorage.getItem("user");
            if (localUser) setUser(JSON.parse(localUser));
        }
    }, [session, status]);

    const getRoleLinks = () => {
        if (!user?.role) return [];

        switch (user.role) {
            case "CUSTOMER":
                return [
                    { href: "/menu", name: "菜單" },
                    { href: "/orders", name: "我的訂單" },
                ];
            case "STAFF":
                return [
                    { href: "/orders/pending", name: "等待中的訂單" },
                    { href: "/orders/ready", name: "完成的訂單" },
                ];
            case "CHEF":
                return [{ href: "/kitchen", name: "廚房訂單" }];
            case "OWNER":
                return [
                    { href: "/admin/menu", name: "菜單管理" },
                    { href: "/admin/users", name: "使用者管理" },
                    { href: "/orders/pending", name: "等待中的訂單" },
                    { href: "/orders/ready", name: "完成的訂單" },
                    { href: "/kitchen", name: "廚房訂單" },
                ];
            default:
                return [];
        }
    };
    const handelSignOut = () => {
        signOut({ callbackUrl: "/" });
        sessionStorage.removeItem("user");
        setUser(null);
        setIsLogin(false);
    };
    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center overflow-x-auto">
                <Link
                    href="/"
                    className="text-2xl font-bold tracking-wide hover:opacity-90 transition-opacity duration-300"
                    aria-label="前往首頁"
                >
                    🍽 網路早餐訂餐系統
                </Link>

                <div className="flex flex-wrap items-center gap-4">
                    {status === "loading" ? (
                        <span className="text-sm">載入中...</span>
                    ) : user ? (
                        <>
                            {getRoleLinks().map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-white font-medium hover:underline hover:text-yellow-200 transition duration-300"
                                    aria-label={link.name}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <span className="hidden sm:inline-block font-semibold">
                                您好，{user.name}
                            </span>

                            <NotifyButton />

                            <button
                                onClick={handelSignOut}
                                className="bg-white text-pink-600 font-semibold px-3 py-1.5 rounded-md hover:bg-gray-100 transition duration-300"
                                aria-label="登出帳號"
                            >
                                登出
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-white text-pink-600 font-semibold px-4 py-1.5 rounded-md hover:bg-gray-100 transition duration-300"
                            aria-label="登入帳號"
                        >
                            登入
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
