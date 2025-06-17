import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET: 獲取單一訂單詳情 (訂單擁有者或 STAFF/OWNER 可用)
export async function GET(request, { params }) {
    const resolvedParams = await params;
    const orderId = resolvedParams.orderId;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        if (!orderId) {
            return NextResponse.json({ error: "缺少訂單 ID" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: "訂單不存在" }, { status: 404 });
        }

        if (
            order.customerId !== session.user.id &&
            session.user.role !== "STAFF" &&
            session.user.role !== "OWNER"
        ) {
            return NextResponse.json({ error: "無權限查看此訂單" }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error(`獲取訂單 ${orderId} 詳情時發生錯誤:`, error);
        return NextResponse.json({ error: "獲取訂單詳情失敗" }, { status: 500 });
    }
}
