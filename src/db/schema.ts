import { pgTable, pgEnum, text, integer, date, timestamp } from "drizzle-orm/pg-core";

export const bookStatusEnum = pgEnum("book_status", [
  "want_to_read",
  "reading",
  "read",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const books = pgTable("books", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  genre: text("genre").notNull(),
  status: bookStatusEnum("status").notNull().default("want_to_read"),
  rating: integer("rating"),
  coverUrl: text("cover_url").notNull().default(""),
  notes: text("notes").notNull().default(""),
  publisher: text("publisher"),
  publishedDate: text("published_date"),
  pageCount: integer("page_count"),
  buyLink: text("buy_link"),
  previewLink: text("preview_link"),
  startedAt: date("started_at"),
  finishedAt: date("finished_at"),
  createdAt: date("created_at").notNull(),
});
