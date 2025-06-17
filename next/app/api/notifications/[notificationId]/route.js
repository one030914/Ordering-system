import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// DELETE: 刪除特定通知 (通知擁有者或 STAFF/OWNER 可用)
export async function DELETE(request, { params }) {
    const resolvedParams = await params;
    const notificationId = resolvedParams.notificationId;

    try {
        // 1. 權限驗證
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        if (!notificationId) {
            return NextResponse.json({ error: "缺少通知 ID" }, { status: 400 });
        }

        // 2. 查找通知以進行權限判斷
        const notification = await prisma.notification.findUnique({
            where: {
                id: notificationId,
            },
        });

        if (!notification) {
            return NextResponse.json({ error: "通知不存在" }, { status: 404 });
        }

        // 權限判斷：通知擁有者可刪除，STAFF/OWNER 可刪除任何人的
        if (notification.userId !== session.user.id && session.user.role !== 'STAFF' && session.user.role !== 'OWNER') {
            return NextResponse.json({ error: "無權限刪除此通知" }, { status: 403 });
        }

        // 3. 執行刪除操作
        await prisma.notification.delete({
            where: {
                id: notificationId,
            },
        });

        // 4. 回傳成功訊息
        return NextResponse.json({ message: "通知已刪除" });

    } catch (error) {
        console.error(`刪除通知 ${notificationId} 時發生錯誤:`, error);
        return NextResponse.json({ error: "刪除通知失敗" }, { status: 500 });
    }
} 