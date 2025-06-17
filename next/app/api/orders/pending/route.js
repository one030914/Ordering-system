import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        if (session.user.role !== "STAFF" && session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        const pendingOrders = await prisma.order.findMany({
            where: {
                status: "PENDING",
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

        return NextResponse.json(pendingOrders);
    } catch (error) {
        console.error("獲取待處理訂單時發生錯誤:", error);
        return NextResponse.json({ error: "獲取待處理訂單失敗" }, { status: 500 });
    }
}
