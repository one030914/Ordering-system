import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH: 將特定用戶的所有未讀通知標記為已讀 (用戶本人或 STAFF/OWNER 可用)
export async function PATCH(request, { params }) {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    try {
        // 1. 權限驗證
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        // 權限判斷：用戶本人可修改自己的，STAFF/OWNER 可修改任何人的
        if (
            session.user.id !== userId &&
            session.user.role !== "STAFF" &&
            session.user.role !== "OWNER"
        ) {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        if (!userId) {
            return NextResponse.json({ error: "缺少用戶 ID" }, { status: 400 });
        }

        // 2. 更新通知狀態
        // 注意：這裡只更新未讀的通知為已讀
        const updatedNotifications = await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        // 3. 回傳更新結果
        // updateMany 不會返回更新的記錄，只返回更新的數量
        return NextResponse.json({
            count: updatedNotifications.count,
            message: "通知已標記為已讀",
        });
    } catch (error) {
        console.error(`更新用戶 ${userId} 通知為已讀時發生錯誤:`, error);
        return NextResponse.json({ error: "更新通知狀態失敗" }, { status: 500 });
    }
}
