import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH: 更新訂單狀態 (STAFF, CHEF, OWNER 或訂單擁有者取消自己的訂單)
export async function PATCH(request, { params }) {
    const resolvedParams = await params;
    const orderId = resolvedParams.orderId;

    try {
        // 1. 權限驗證
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        const { status } = await request.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: "缺少訂單 ID 或狀態" }, { status: 400 });
        }

        // 確保新狀態是合法的 OrderStatus enum 值
        const validStatuses = ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "無效的訂單狀態" }, { status: 400 });
        }

        // 2. 查找訂單以進行權限判斷
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: "訂單不存在" }, { status: 404 });
        }

        // 權限判斷：
        // - 如果是 STAFF, CHEF, OWNER 角色，則有權限修改任何狀態。
        // - 如果是訂單擁有者，並且嘗試將狀態改為 CANCELLED，則有權限。
        const isStaffOrOwner =
            session.user.role === "STAFF" ||
            session.user.role === "OWNER" ||
            session.user.role === "CHEF";
        const isOrderOwnerAndCancelling =
            session.user.id === order.customerId && status === "CANCELLED";

        if (!isStaffOrOwner && !isOrderOwnerAndCancelling) {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

        // 3. 更新訂單狀態
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: status,
                ...(status === "READY" && { completedAt: new Date() }), // 如果狀態變為 READY，記錄完成時間
            },
            include: {
                customer: { select: { id: true, email: true } },
            },
        });

        // 4. 根據狀態變化觸發通知/MQTT 訊息 (這裡只是範例，你需要根據你的 MQTT Topic 設計來發送)
        if (status === "PREPARING") {
            // 通知顧客：訂單正在準備中
            await prisma.notification.create({
                data: {
                    userId: updatedOrder.customerId,
                    orderId: updatedOrder.id,
                    message: "您的訂單已確認，正在準備中！",
                },
            });
            // 這裡可以發送 MQTT 訊息給廚房或顧客
            // publishToMqtt("kitchen/new_order", updatedOrder);
        } else if (status === "READY") {
            // 通知顧客：餐點已完成，可取餐
            await prisma.notification.create({
                data: {
                    userId: updatedOrder.customerId,
                    orderId: updatedOrder.id,
                    message: "您的餐點已完成，請憑訂單號碼前往櫃檯取餐！",
                },
            });
            // 這裡可以發送 MQTT 訊息給店員（有餐點待取）或顧客
            // publishToMqtt(`customer/${updatedOrder.customerId}/order_ready`, updatedOrder);
        } else if (status === "COMPLETED") {
            // 通知顧客：訂單已完成取餐 (如果你有取餐確認流程)
            await prisma.notification.create({
                data: {
                    userId: updatedOrder.customerId,
                    orderId: updatedOrder.id,
                    message: "您的訂單已成功取餐，感謝您的光臨！",
                },
            });
            // publishToMqtt(`customer/${updatedOrder.customerId}/order_completed`, updatedOrder);
        } else if (status === "CANCELLED") {
            // 通知顧客：訂單已取消
            await prisma.notification.create({
                data: {
                    userId: updatedOrder.customerId,
                    orderId: updatedOrder.id,
                    message: "您的訂單已取消。",
                },
            });
            // publishToMqtt(`customer/${updatedOrder.customerId}/order_cancelled`, updatedOrder);
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error(`更新訂單 ${orderId} 狀態時發生錯誤:`, error);
        return NextResponse.json({ error: "更新訂單狀態失敗" }, { status: 500 });
    }
}
