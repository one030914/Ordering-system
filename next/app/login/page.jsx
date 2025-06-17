"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleOAuthLogin = async (provider) => {
        try {
            setIsLoading(true);
            setError("");

            const result = await signIn(provider, {
                redirect: false,
                callbackUrl: "/",
            });

            if (result?.error) {
                setError("登入失敗，請稍後再試");
                return;
            }

            if (result?.url) {
                router.push(result.url);
            }
        } catch (err) {
            setError("登入失敗，請稍後再試");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-pink-400 to-red-400 px-4">
            <div className="max-w-md w-full bg-white/30 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8 transition-all">
                <h2 className="text-3xl font-extrabold text-center text-gray-700 drop-shadow mb-6">
                    登入帳號
                </h2>

                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center font-medium bg-red-100 p-2 rounded-md shadow-sm">
                        ⚠️ {error}
                    </div>
                )}
                <div className="mt-6 text-center">
                    <div className="space-y-3">
                        <button
                            onClick={() => handleOAuthLogin("google")}
                            disabled={isLoading}
                            className="w-full bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Image src="/google.png" alt="Google" width={24} height={24} />
                            使用 Google 登入
                        </button>
                        <button
                            onClick={() => handleOAuthLogin("github")}
                            disabled={isLoading}
                            className="w-full bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Image src="/github.png" alt="GitHub" width={24} height={24} />
                            使用 GitHub 登入
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
