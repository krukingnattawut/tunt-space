import { NextResponse } from "next/server";

// v01 uses one shared password for all teachers, stored as an env var.
// This is intentionally simple — upgrade to real accounts (e.g. NextAuth)
// before rolling this out beyond a small pilot.
export async function POST(req) {
  const { password } = await req.json();
  const correct = process.env.TEACHER_PASSWORD || "tunt2026";

  if (password !== correct) {
    return NextResponse.json({ ok: false, error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("tunt_teacher", "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}
