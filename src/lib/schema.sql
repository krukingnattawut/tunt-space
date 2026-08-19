-- TUNT Space v01 schema
-- Run this once via /api/init-db (GET request) after connecting your database,
-- or paste it into the Neon / Supabase SQL editor.

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,       -- anonymous handle shown to other students, e.g. TUNT-3820
  full_name TEXT NOT NULL,           -- real name, visible to teachers only
  phone TEXT NOT NULL,               -- contact number, visible to teachers only
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,                -- great / good / neutral / tired / bad
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,     -- true if a risk keyword was detected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_student ON checkins(student_id);
CREATE INDEX IF NOT EXISTS idx_posts_student ON posts(student_id);
