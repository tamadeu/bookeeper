import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { books } from "../db/schema";
import { MOCK_BOOKS } from "../data/mockBooks";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL não definida. Crie um arquivo .env.local.");
    process.exit(1);
  }

  const client = postgres(url);
  const db = drizzle(client);

  console.log("🌱 Inserindo livros de exemplo...");

  for (const book of MOCK_BOOKS) {
    await db
      .insert(books)
      .values({
        id: book.id ?? randomUUID(),
        title: book.title,
        author: book.author,
        genre: book.genre,
        status: book.status,
        rating: book.rating,
        coverUrl: book.coverUrl,
        notes: book.notes,
        startedAt: book.startedAt,
        finishedAt: book.finishedAt,
        createdAt: book.createdAt,
      })
      .onConflictDoNothing();
  }

  console.log(`✅ ${MOCK_BOOKS.length} livros inseridos (duplicatas ignoradas).`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
