import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

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
        // 1. 權限驗證 - 確保用戶已登入且為 CUSTOMER
        const session = await auth();
        if (!session?.user || session.user.role !== "CUSTOMER") {
            return NextResponse.json({ error: "未授權或無權限執行此操作" }, { status: 403 });
        }

        const customerId = session.user.id;
        const { items } = await request.json(); // 從請求體中獲取訂單項目

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "訂單中必須包含項目" }, { status: 400 });
        }

        // 2. 計算總金額並驗證菜單項目
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            });

            if (!menuItem || !menuItem.isAvailable) {
                return NextResponse.json(
                    { error: `菜單項目 ${item.menuItemId} 不存在或不可用` },
                    { status: 400 }
                );
            }
            if (item.quantity <= 0) {
                return NextResponse.json(
                    { error: `菜單項目 ${item.menuItemId} 數量必須大於 0` },
                    { status: 400 }
                );
            }

            totalAmount += menuItem.price * item.quantity;
            orderItemsData.push({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                specialRequest: item.specialRequest || null,
            });
        }

        // 3. 創建訂單和訂單項目 (使用事務確保資料一致性)
        const newOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    customerId: customerId,
                    totalAmount: totalAmount,
                    status: "PENDING", // 預設為待處理
                    paymentStatus: false, // 預設為未付款
                    items: {
                        create: orderItemsData,
                    },
                },
            });
            return order;
        });

        // 4. (可選) 觸發通知或 MQTT 訊息
        // 在這裡可以新增邏輯，例如通知廚師有新訂單，或通知店員有新訂單需要確認付款
        // await prisma.notification.create({ ... });
        // publishOrderNotification(kitchenTopic, newOrder);

        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error("創建訂單時發生錯誤:", error);
        return NextResponse.json({ error: "創建訂單失敗" }, { status: 500 });
    }
}
