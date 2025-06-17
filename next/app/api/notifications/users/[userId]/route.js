import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request, { params }) {
    const resolvedParams = await params; // 確保 params 物件本身被解析
    const userId = resolvedParams.userId; // 然後取得 userId
    try {
        // 驗證用戶是否已登入
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        // 確認請求的用戶 ID 是否與當前登入用戶相符
        if (session.user.id !== userId) {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        // 從資料庫獲取通知
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true,
                        createdAt: true,
                    },
                },
            },
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("獲取通知時發生錯誤:", error);
        return NextResponse.json({ error: "獲取通知失敗" }, { status: 500 });
    }
}

// PATCH: 更新特定用戶通知為已讀 (只有用戶本人，或 STAFF, OWNER 可用)
export async function PATCH(request, { params }) {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        // 權限判斷：
        // 1. 如果是用戶本人，可以修改自己的通知
        // 2. 如果是 STAFF 或 OWNER 角色，可以修改任何用戶的通知
        if (
            session.user.id !== userId &&
            session.user.role !== "STAFF" &&
            session.user.role !== "OWNER"
        ) {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json({ error: "缺少通知 ID" }, { status: 400 });
        }

        const updatedNotification = await prisma.notification.update({
            where: {
                id: notificationId,
                userId: userId, // 確保通知是該用戶的
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json(updatedNotification);
    } catch (error) {
        console.error(`更新用戶 ${userId} 的通知 ${notificationId} 時發生錯誤:`, error);
        return NextResponse.json({ error: "更新通知狀態失敗" }, { status: 500 });
    }
}
