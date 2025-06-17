import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request) {
    try {
        // 1. 權限驗證
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        // 只有 'STAFF' 或 'OWNER' 角色才能存取此路由
        if (session.user.role !== "STAFF" && session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        // 2. 從資料庫獲取待處理訂單
        const pendingOrders = await prisma.order.findMany({
            where: {
                status: "PENDING", // 只獲取待處理狀態的訂單
            },
            include: {
                items: {
                    include: {
                        menuItem: true, // 包含訂單項目的菜單詳細資訊
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true, // 顯示顧客名稱
                    },
                },
            },
            orderBy: {
                createdAt: "asc", // 通常按創建時間升序排列，先處理舊訂單
            },
        });

        // 3. 回傳訂單資料
        return NextResponse.json(pendingOrders);
    } catch (error) {
        console.error("獲取待處理訂單時發生錯誤:", error);
        return NextResponse.json({ error: "獲取待處理訂單失敗" }, { status: 500 });
    }
}
