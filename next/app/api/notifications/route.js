import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// POST: 創建新的通知
export async function POST(request) {
    try {
        const session = await auth();
        // 只有登入用戶或特定角色可以創建通知。
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        const { userId, orderId, message } = await request.json();

        if (!userId || !message) {
            return NextResponse.json({ error: "缺少用戶 ID 或通知訊息" }, { status: 400 });
        }

        const newNotification = await prisma.notification.create({
            data: {
                userId: userId,
                orderId: orderId || null,
                message: message,
                isRead: false,
            },
        });

        return NextResponse.json(newNotification, { status: 201 });
    } catch (error) {
        console.error("創建通知失敗:", error);
        return NextResponse.json({ error: "創建通知失敗" }, { status: 500 });
    }
}
