// app/api/checkout/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return NextResponse.json(
                { success: false, error: "未提供檔案" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
            .from("images") // 請確保 Supabase 上已建立 bucket "uploads"
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) {
            throw error;
        }

        const { data: urlData } = supabase
            .storage
            .from("images")
            .getPublicUrl(data.path);

        const publicUrl = urlData.publicUrl;

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (err) {
        console.error("Upload error", err);
        return NextResponse.json({ success: false, error: "內部錯誤" }, { status: 500 });
    }
}
