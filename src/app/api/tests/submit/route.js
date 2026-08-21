import { getSql } from "@/lib/db";
import { getStudentFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const student = await getStudentFromRequest();
  if (!student) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const { testKey, score, band, level } = await req.json();
  if (!testKey) return NextResponse.json({ ok: false, error: "missing testKey" }, { status: 400 });

  const sql = getSql();
  await sql`
    INSERT INTO test_results (student_id, test_key, score, band) VALUES (${student.id}, ${testKey}, ${score ?? null}, ${band ?? null});
  `;

  // Auto-notify teacher for high-risk clinical results (SDQ / PHQ-A)
  if (level === "high") {
    await sql`
      INSERT INTO messages (student_id, content, sender)
      VALUES (${student.id}, ${`[ระบบแจ้งเตือน] ผลแบบทดสอบ ${testKey} อยู่ในระดับ "${band}" คะแนน ${score} — แนะนำให้ติดตามดูแลนักเรียนคนนี้`}, 'system');
    `;
  }

  return NextResponse.json({ ok: true });
}
