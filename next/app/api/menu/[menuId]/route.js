import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH: 更新特定菜單項目 (只有 OWNER/STAFF 可用)
export async function PATCH(request, { params }) {
    const resolvedParams = await params;
    const menuId = resolvedParams.menuId; // 從動態路由獲取 ID

    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

        const dataToUpdate = await request.json();

        if (!menuId) {
            return NextResponse.json({ error: "缺少菜單項目 ID" }, { status: 400 });
        }

        const updatedMenuItem = await prisma.menuItem.update({
            where: { id: menuId },
            data: {
                ...dataToUpdate,
            },
        });

        return NextResponse.json(updatedMenuItem);
    } catch (error) {
        console.error(`更新菜單項目 ${menuItemId} 時發生錯誤:`, error);
        return NextResponse.json({ error: "更新菜單項目失敗" }, { status: 500 });
    }
}

// DELETE: 刪除特定菜單項目 (只有 OWNER/STAFF 可用)
export async function DELETE(request, { params }) {
    const resolvedParams = await params;
    const menuId = resolvedParams.menuId; // 從動態路由獲取 ID

    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "STAFF")) {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

        if (!menuId) {
            return NextResponse.json({ error: "缺少菜單項目 ID" }, { status: 400 });
        }

        await prisma.menuItem.delete({
            where: { id: menuId },
        });

        return NextResponse.json({ message: "菜單項目刪除成功" }, { status: 200 });
    } catch (error) {
        console.error(`刪除菜單項目 ${menuItemId} 時發生錯誤:`, error);
        return NextResponse.json({ error: "刪除菜單項目失敗" }, { status: 500 });
    }
}
