import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request, { params }) {
    const resolvedParams = await params;
    const customerId = resolvedParams.customerId;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        if (
            session.user.role !== "CUSTOMER" &&
            session.user.role !== "STAFF" &&
            session.user.role !== "OWNER"
        ) {
            return NextResponse.json({ error: "無權限存取" }, { status: 403 });
        }

        const orders = await prisma.order.findMany({
            where: {
                customerId: customerId,
            },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("獲取顧客訂單時發生錯誤:", error);
        return NextResponse.json({ error: "獲取顧客訂單失敗" }, { status: 500 });
    }
}
