import { neon } from "@neondatabase/serverless";

// DATABASE_URL is auto-injected by Vercel when you connect a Neon/Postgres
// database from the Vercel dashboard (Storage tab). Locally, put it in .env.local
export function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Connect a Postgres database in Vercel (Storage tab) or add DATABASE_URL to .env.local"
    );
  }
  return neon(url);
}
