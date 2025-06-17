import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// POST: 創建新的通知
export async function POST(request) {
    try {
        const session = await auth();
        // 只有登入用戶或特定角色可以創建通知 (例如 STAFF 或 OWNER 可以為任何人創建通知)
        // 這裡暫時設定為只要登入就可以創建，你可以根據需求調整權限。
        // 如果是後端觸發的通知，可能不需要使用者session。
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
                orderId: orderId || null, // orderId 是可選的
                message: message,
                isRead: false, // 預設為未讀
            },
        });

        return NextResponse.json(newNotification, { status: 201 });
    } catch (error) {
        console.error("創建通知失敗:", error);
        return NextResponse.json({ error: "創建通知失敗" }, { status: 500 });
    }
}
