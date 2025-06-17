import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET: 獲取所有用戶 (只有 OWNER 可用)
export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        if (session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限存取此資源" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("獲取用戶列表時發生錯誤:", error);
        return NextResponse.json({ error: "獲取用戶列表失敗" }, { status: 500 });
    }
}
