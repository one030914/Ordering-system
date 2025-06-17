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

        const validStatuses = ["PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "無效的訂單狀態" }, { status: 400 });
        }

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

        const isStaffOrOwner =
            session.user.role === "STAFF" ||
            session.user.role === "OWNER" ||
            session.user.role === "CHEF";
        const isOrderOwnerAndCancelling =
            session.user.id === order.customerId && status === "CANCELLED";

        if (!isStaffOrOwner && !isOrderOwnerAndCancelling) {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

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

        switch (status) {
            case "PREPARING":
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

                const kitchenTopic = getKitchenOrderTopic();
                publishMessage(kitchenTopic, JSON.stringify(order));
                break;

            case "READY":
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
                break;
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Failed to update order status:", error);
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }
}
