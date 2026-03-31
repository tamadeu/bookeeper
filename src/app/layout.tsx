import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BooksProvider } from "@/context/BooksContext";
import { getAllBooks } from "@/actions/books";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookeeper",
  description: "Sua biblioteca pessoal de livros",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const books = await getAllBooks().catch(() => []);

  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <BooksProvider initialBooks={books}>{children}</BooksProvider>
      </body>
    </html>
  );
}
