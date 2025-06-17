import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        if (session.user.role !== "CHEF" && session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        const kitchenOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["PENDING", "PREPARING"],
                },
            },
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
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json(kitchenOrders);
    } catch (error) {
        console.error("獲取廚房訂單時發生錯誤:", error);
        return NextResponse.json({ error: "獲取廚房訂單失敗" }, { status: 500 });
    }
}
