import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

// Public read of app settings (e.g. logo, app name)
export async function GET() {
  const sql = getSql();
  const rows = await sql`SELECT key, value FROM app_settings;`;
  const settings = {};
  rows.forEach((r) => (settings[r.key] = r.value));
  return NextResponse.json({ ok: true, settings });
}
