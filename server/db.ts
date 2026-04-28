import "dotenv/config";
import { Pool } from 'pg';
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT 
    current_database(), 
    current_schema(), 
    to_regclass('public.categories') AS categories_table
`).then((result) => {
  console.log("[DB CHECK]", result.rows);
}).catch((err) => {
  console.error("[DB CHECK ERROR]", err);
});

export const db = drizzle({ client: pool, schema });