import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request, { params }) {
    const resolvedParams = await params; // 確保 params 物件本身被解析
    const customerId = resolvedParams.customerId; // 從動態路由中獲取 customerId

    try {
        // 1. 權限驗證
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        // 確保只有登入用戶能查看自己的訂單，或者特定角色（如老闆、店員）可以查看
        // 這裡可以根據你的 `User` model 中的 `role` 欄位來擴展權限邏輯
        // 假設 session.user.id 是登入用戶的 ID
        // if (session.user.role === "CUSTOMER" && session.user.id !== customerId) {
        //     return NextResponse.json({ error: "無權限存取此客戶的訂單" }, { status: 403 });
        // }

        // 如果是 STAFF 或 OWNER 角色，則允許查看所有客戶訂單
        // 這部分的邏輯需要根據你實際的角色定義來調整
        // 例如：
        if (session.user.role !== 'CUSTOMER' && session.user.role !== 'STAFF' && session.user.role !== 'OWNER') {
            return NextResponse.json({ error: "無權限存取" }, { status: 403 });
        }

        // 2. 從資料庫獲取訂單
        const orders = await prisma.order.findMany({
            where: {
                customerId: customerId,
            },
            include: {
                items: {
                    include: {
                        menuItem: true, // 包含訂單項目的菜單詳細資訊
                    },
                },
            },
            orderBy: {
                createdAt: "desc", // 按最新訂單排序
            },
        });

        // 3. 回傳訂單資料
        return NextResponse.json(orders);
    } catch (error) {
        console.error("獲取顧客訂單時發生錯誤:", error);
        return NextResponse.json({ error: "獲取顧客訂單失敗" }, { status: 500 });
    }
}
