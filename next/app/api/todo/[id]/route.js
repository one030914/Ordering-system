import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

// GET 單筆 todo
export async function GET(request, { params }) {
    const { id } = params;

    const todo = await prisma.todo.findUnique({
        where: { id: Number(id) },
    });

    if (!todo) {
        return NextResponse.json({ error: `Todo with id ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(todo);
}

// DELETE 單筆 todo
export async function DELETE(request, { params }) {
    const { id } = params;

    try {
        const todo = await prisma.todo.delete({
            where: { id: Number(id) },
        });
        return NextResponse.json(todo);
    } catch (error) {
        return NextResponse.json({ error: `Todo with id ${id} not found` }, { status: 404 });
    }
}

// PATCH 更新單筆 todo（例如 title 或 isDone）
export async function PATCH(request, { params }) {
    const { id } = params;
    const body = await request.json();

    try {
        const todo = await prisma.todo.update({
            where: { id: Number(id) },
            data: body,
        });
        return NextResponse.json(todo);
    } catch (error) {
        return NextResponse.json({ error: `Todo with id ${id} not found` }, { status: 404 });
    }
}
