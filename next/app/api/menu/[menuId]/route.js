// app/api/menu/[menuId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req, { params }) {
  const id = params.menuId;
  try {
    const body = await req.json();
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name:        body.name,
        description: body.description,
        price:       body.price,
        imageUrl:    body.imageUrl,
        isAvailable: body.isAvailable,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("更新菜單失敗:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const id = params.menuId;
  try {
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("刪除菜單失敗:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
