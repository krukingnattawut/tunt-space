import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sql = getSql();
  const rows = await sql`SELECT id, title, content, created_at FROM news ORDER BY created_at DESC LIMIT 30;`;
  return NextResponse.json({ ok: true, news: rows });
}
