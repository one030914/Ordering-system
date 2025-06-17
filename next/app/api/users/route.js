import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET: 獲取所有用戶 (只有 OWNER 可用)
export async function GET(request) {
    try {
        // 1. 權限驗證
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        // 只有 'OWNER' 角色才能存取此路由
        if (session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        // 2. 從資料庫獲取所有用戶
        // 注意：這裡不應該包含敏感資訊如密碼，即使是老闆也不應該直接查看加密後的密碼
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // 不包含 password 欄位
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        // 3. 回傳用戶資料
        return NextResponse.json(users);
    } catch (error) {
        console.error("獲取用戶列表時發生錯誤:", error);
        return NextResponse.json({ error: "獲取用戶列表失敗" }, { status: 500 });
    }
}
