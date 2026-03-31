import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "drizzle-kit";

// Carrega .env.local para que drizzle-kit encontre DATABASE_URL
try {
  const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([^#=][^=]*?)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] ??= match[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // .env.local ausente — variáveis já devem estar no ambiente
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
