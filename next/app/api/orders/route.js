import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getOrderCheckoutTopic } from "@/utils/mqttTopic";
import { publishMessage } from "@/utils/mqttClient";

// GET: 獲取所有訂單 (只有 OWNER/STAFF 可用)
export async function GET(request) {
    try {
        // 1. 權限驗證 - 確保用戶已登入且為 OWNER 或 STAFF
        const session = await auth();
        if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
            return NextResponse.json({ error: "未授權或無權限存取此資源" }, { status: 403 });
        }

        // 2. 從資料庫獲取所有訂單
        const allOrders = await prisma.order.findMany({
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
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc", // 按最新訂單排序
            },
        });

        // 3. 回傳訂單資料
        return NextResponse.json(allOrders);
    } catch (error) {
        console.error("獲取所有訂單時發生錯誤:", error);
        return NextResponse.json({ error: "獲取所有訂單失敗" }, { status: 500 });
    }
}

// POST: 創建新訂單 (只有登入的 CUSTOMER 可以)
export async function POST(request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { items, totalAmount } = await request.json();

        // 1. 創建訂單
        const newOrder = await prisma.order.create({
            data: {
                customerId: session.user.id,
                totalAmount,
                status: "PENDING",
                items: {
                    create: items.map((item) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        specialRequest: item.specialRequest,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                customer: true,
            },
        });

        // 2. 發送 MQTT 訊息通知新訂單
        const topic = getOrderCheckoutTopic();
        publishMessage(topic, JSON.stringify(newOrder));

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
