import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getOrderCheckoutTopic } from "@/utils/mqttTopic";
import { publishMessage } from "@/utils/mqttClient";

// GET: 獲取所有訂單 (只有 OWNER/STAFF 可用)
export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
            return NextResponse.json({ error: "未授權或無權限存取此資源" }, { status: 403 });
        }

        const allOrders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

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

        const topic = getOrderCheckoutTopic();
        publishMessage(topic, JSON.stringify(newOrder));

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error("Failed to create order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
