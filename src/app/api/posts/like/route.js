import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { postId } = await req.json();
    const sql = getSql();
    const rows = await sql`
      UPDATE posts SET likes = likes + 1 WHERE id = ${postId} RETURNING likes;
    `;
    return NextResponse.json({ ok: true, likes: rows[0]?.likes });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
