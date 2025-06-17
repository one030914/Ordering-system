import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
    getAcceptCustomerOrderTopic,
    getKitchenOrderTopic,
    getKitchenReadyOrderTopic,
    getStaffCompletedOrderTopic,
} from "@/utils/mqttTopic";
import { publishMessage } from "@/utils/mqttClient";

// PATCH: 更新訂單狀態 (STAFF, CHEF, OWNER 或訂單擁有者取消自己的訂單)
export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId } = await params;
        const { status } = await request.json();

        // 確保新狀態是合法的 OrderStatus enum 值
        const validStatuses = ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "無效的訂單狀態" }, { status: 400 });
        }

        // 獲取訂單詳情
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: true,
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
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

        // 更新訂單狀態
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                customer: true,
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        // 根據不同的狀態發送不同的 MQTT 訊息
        switch (status) {
            case "PREPARING":
                // 通知顧客訂單正在製作
                const acceptTopic = getAcceptCustomerOrderTopic(order.customerId);
                publishMessage(
                    acceptTopic,
                    JSON.stringify({
                        id: orderId,
                        title: "訂單",
                        type: "order",
                        content: `訂單 ${orderId.slice(0, 8)} 正在製作中`,
                        read: false,
                        time: new Date().toLocaleString(),
                        status: "PREPARING",
                        orderId: orderId,
                    })
                );

                // 通知廚房新訂單
                const kitchenTopic = getKitchenOrderTopic();
                publishMessage(kitchenTopic, JSON.stringify(order));
                break;

            case "READY":
                // 通知顧客訂單已完成
                const readyTopic = getKitchenReadyOrderTopic(order.customerId);
                publishMessage(
                    readyTopic,
                    JSON.stringify({
                        id: orderId,
                        title: "訂單",
                        type: "order",
                        content: `可領取訂單 ${orderId.slice(0, 8)}`,
                        read: false,
                        time: new Date().toLocaleString(),
                        status: "READY",
                        orderId: orderId,
                    })
                );
                break;

            case "COMPLETED":
                // 通知顧客訂單已領取
                const completedTopic = getStaffCompletedOrderTopic(order.customerId);
                publishMessage(
                    completedTopic,
                    JSON.stringify({
                        id: orderId,
                        title: "訂單",
                        type: "order",
                        content: `訂單 ${orderId.slice(0, 8)} 已完成`,
                        read: false,
                        time: new Date().toLocaleString(),
                        status: "COMPLETED",
                        orderId: orderId,
                    })
                );
                break;

            case "CANCELLED":
                // 通知顧客訂單已取消 (這裡不需要發送給所有人的 MQTT 訊息，因為顧客自己取消了)
                // 可以考慮發送給 STAFF/OWNER 的私人通知
                break;
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Failed to update order status:", error);
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }
}
