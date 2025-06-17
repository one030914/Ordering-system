import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        const { customerId, items, totalAmount } = body;

        if (!customerId || !items?.length || totalAmount == null) {
            return NextResponse.json({ error: "欄位不完整" }, { status: 400 });
        }

        const newOrder = await prisma.order.create({
            data: {
                customerId,
                totalAmount,
                items: {
                    create: items.map((item) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        specialRequest: item.specialRequest || null,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error("建立訂單錯誤:", error);
        return NextResponse.json({ error: "訂單建立失敗" }, { status: 500 });
    }
}
