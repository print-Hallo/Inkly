import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Use the connection string from Supabase (Settings > Database)
const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString, { prepare: false }); 
export const db = drizzle(client);