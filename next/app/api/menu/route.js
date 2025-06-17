import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// GET: 獲取所有菜單項目 (顧客可查看已上架，管理者可查看所有)
export async function GET(request) {
    try {
        const session = await auth();

        let menuItems;

        if (session?.user?.role === "OWNER" || session?.user?.role === "STAFF") {
            // 管理者可以查看所有菜單項目，包括未上架的
            menuItems = await prisma.menuItem.findMany({
                orderBy: {
                    name: "asc",
                },
            });
        } else {
            // 顧客只能查看已上架的菜單項目
            menuItems = await prisma.menuItem.findMany({
                where: {
                    isAvailable: true,
                },
                orderBy: {
                    name: "asc",
                },
            });
        }

        return NextResponse.json(menuItems);
    } catch (error) {
        console.error("獲取菜單項目時發生錯誤:", error);
        return NextResponse.json({ error: "獲取菜單失敗" }, { status: 500 });
    }
}

// POST: 新增菜單項目 (只有 OWNER/STAFF 可用)
export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

        const { name, description, price, imageUrl, isAvailable } = await request.json();

        if (!name || !price) {
            return NextResponse.json({ error: "名稱和價格為必填項" }, { status: 400 });
        }

        const newMenuItem = await prisma.menuItem.create({
            data: {
                name,
                description,
                price,
                imageUrl,
                isAvailable: isAvailable ?? true, // 預設為 true
            },
        });

        return NextResponse.json(newMenuItem, { status: 201 });
    } catch (error) {
        console.error("新增菜單項目時發生錯誤:", error);
        return NextResponse.json({ error: "新增菜單項目失敗" }, { status: 500 });
    }
}
