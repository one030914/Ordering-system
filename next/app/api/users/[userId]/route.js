import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH: 更新特定用戶資料 (只有 OWNER 可用)
export async function PATCH(request, { params }) {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        if (session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

        const dataToUpdate = await request.json();
        const { role, ...otherData } = dataToUpdate;

        if (!userId) {
            return NextResponse.json({ error: "用戶 ID 為必填項" }, { status: 400 });
        }

        if (role) {
            const validRoles = ["CUSTOMER", "STAFF", "CHEF", "OWNER"];
            if (!validRoles.includes(role)) {
                return NextResponse.json({ error: "無效的角色" }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...otherData,
                ...(role && { role: role }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(`更新用戶 ${userId} 時發生錯誤:`, error);
        return NextResponse.json({ error: "更新用戶資料失敗" }, { status: 500 });
    }
}

// DELETE: 刪除特定用戶 (只有 OWNER 可用)
export async function DELETE(request, { params }) {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

        if (!userId) {
            return NextResponse.json({ error: "用戶 ID 為必填項" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ message: "用戶刪除成功" }, { status: 200 });
    } catch (error) {
        console.error(`刪除用戶 ${userId} 時發生錯誤:`, error);
        return NextResponse.json({ error: "刪除用戶失敗" }, { status: 500 });
    }
}
