import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH: 更新特定用戶資料 (只有 OWNER 可用)
export async function PATCH(request, { params }) {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    try {
        // 1. 權限驗證
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "未授權" }, { status: 401 });
        }

        // 只有 'OWNER' 角色才能執行此操作
        if (session.user.role !== "OWNER") {
            return NextResponse.json({ error: "無權限執行此操作" }, { status: 403 });
        }

        const dataToUpdate = await request.json();
        const { role, ...otherData } = dataToUpdate; // 提取 role，允許更新其他字段

        if (!userId) {
            return NextResponse.json({ error: "用戶 ID 為必填項" }, { status: 400 });
        }

        // 如果傳入了 role，則確保它是合法的 Role enum 值
        if (role) {
            const validRoles = ["CUSTOMER", "STAFF", "CHEF", "OWNER"];
            if (!validRoles.includes(role)) {
                return NextResponse.json({ error: "無效的角色" }, { status: 400 });
            }
        }

        // 2. 更新用戶資料
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...otherData,
                ...(role && { role: role }), // 如果有 role 才更新 role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true,
            }, // 只回傳更新後的非敏感資訊
        });

        // 3. 回傳更新後的用戶資料
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
