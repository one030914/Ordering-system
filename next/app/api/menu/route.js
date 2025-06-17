// app/api/menu/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany();
    console.log("GET /api/menu →", menuItems);
    return NextResponse.json(menuItems);
  } catch (e) {
    console.error("取得菜單失敗:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const created = await prisma.menuItem.create({ data: body });
    return NextResponse.json(created);
  } catch (e) {
    console.error("建立菜單失敗:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
