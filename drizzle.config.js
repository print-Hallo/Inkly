import { defineConfig } from "drizzle-kit";
import 'dotenv/config'; // Add this to load your variables!

export default defineConfig({
  schema: "./lib/auth-schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});