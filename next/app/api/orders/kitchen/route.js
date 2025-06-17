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

        // 只有 'CHEF' 或 'OWNER' 角色才能存取此路由
        if (session.user.role !== 'CHEF' && session.user.role !== 'OWNER') {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        // 2. 從資料庫獲取廚房相關訂單
        // 這裡可以定義哪些狀態的訂單是廚房需要處理的
        const kitchenOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["PENDING", "PREPARING"], // 廚房通常處理待處理和準備中的訂單
                },
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
                createdAt: "asc", // 廚房通常按時間順序處理訂單 (最早的先處理)
            },
        });

        // 3. 回傳訂單資料
        return NextResponse.json(kitchenOrders);

    } catch (error) {
        console.error("獲取廚房訂單時發生錯誤:", error);
        return NextResponse.json({ error: "獲取廚房訂單失敗" }, { status: 500 });
    }
} 