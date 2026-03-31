"use server";

import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { books as booksTable } from "@/db/schema";
import { Book, BookGenre } from "@/types/book";

export type CreateBookInput = Omit<Book, "id" | "createdAt">;
export type UpdateBookInput = Partial<Omit<Book, "id" | "createdAt">>;

type BookRow = typeof booksTable.$inferSelect;

function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre as BookGenre,
    status: row.status,
    rating: row.rating,
    coverUrl: row.coverUrl,
    notes: row.notes,
    publisher: row.publisher ?? null,
    publishedDate: row.publishedDate ?? null,
    pageCount: row.pageCount ?? null,
    buyLink: row.buyLink ?? null,
    previewLink: row.previewLink ?? null,
    startedAt: row.startedAt ? String(row.startedAt).split("T")[0] : null,
    finishedAt: row.finishedAt ? String(row.finishedAt).split("T")[0] : null,
    createdAt: String(row.createdAt).split("T")[0],
  };
}

export async function getAllBooks(): Promise<Book[]> {
  const rows = await db
    .select()
    .from(booksTable)
    .orderBy(desc(booksTable.createdAt));
  return rows.map(rowToBook);
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const id = randomUUID();
  const createdAt = new Date().toISOString().split("T")[0];

  const [row] = await db
    .insert(booksTable)
    .values({
      id,
      title: input.title,
      author: input.author,
      genre: input.genre,
      status: input.status,
      rating: input.rating ?? null,
      coverUrl: input.coverUrl,
      notes: input.notes,
      publisher: input.publisher ?? null,
      publishedDate: input.publishedDate ?? null,
      pageCount: input.pageCount ?? null,
      buyLink: input.buyLink ?? null,
      previewLink: input.previewLink ?? null,
      startedAt: input.startedAt || null,
      finishedAt: input.finishedAt || null,
      createdAt,
    })
    .returning();

  return rowToBook(row);
}

export async function editBook(
  id: string,
  input: UpdateBookInput
): Promise<void> {
  const updateValues: Partial<typeof booksTable.$inferInsert> = {};

  if (input.title !== undefined) updateValues.title = input.title;
  if (input.author !== undefined) updateValues.author = input.author;
  if (input.genre !== undefined) updateValues.genre = input.genre;
  if (input.status !== undefined) updateValues.status = input.status;
  if (input.rating !== undefined) updateValues.rating = input.rating ?? null;
  if (input.coverUrl !== undefined) updateValues.coverUrl = input.coverUrl;
  if (input.notes !== undefined) updateValues.notes = input.notes;
  if (input.publisher !== undefined) updateValues.publisher = input.publisher ?? null;
  if (input.publishedDate !== undefined) updateValues.publishedDate = input.publishedDate ?? null;
  if (input.pageCount !== undefined) updateValues.pageCount = input.pageCount ?? null;
  if (input.buyLink !== undefined) updateValues.buyLink = input.buyLink ?? null;
  if (input.previewLink !== undefined) updateValues.previewLink = input.previewLink ?? null;
  if (input.startedAt !== undefined) updateValues.startedAt = input.startedAt || null;
  if (input.finishedAt !== undefined) updateValues.finishedAt = input.finishedAt || null;

  if (Object.keys(updateValues).length === 0) return;

  await db.update(booksTable).set(updateValues).where(eq(booksTable.id, id));
}

export async function removeBook(id: string): Promise<void> {
  await db.delete(booksTable).where(eq(booksTable.id, id));
}
