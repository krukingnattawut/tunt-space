import { getSql } from "@/lib/db";
import { NextResponse } from "next/server";

// Visit /api/init-db once in your browser after connecting a database
// on Vercel. Safe to run multiple times (IF NOT EXISTS everywhere).
export async function GET() {
  try {
    const sql = getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        handle TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        class_room TEXT,
        phone TEXT NOT NULL,
        nickname TEXT,
        avatar_emoji TEXT DEFAULT '🙂',
        avatar_color TEXT DEFAULT '#9B8CFF',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        mood TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        flagged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        sender TEXT NOT NULL DEFAULT 'student', -- 'student' or 'teacher'
        read_by_teacher BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        sender TEXT NOT NULL DEFAULT 'student', -- 'student' or 'teacher'
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_checkins_student ON checkins(student_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_student ON posts(student_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);`;

    return NextResponse.json({ ok: true, message: "Database ready (v03 schema)" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
