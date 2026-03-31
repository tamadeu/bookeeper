import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BooksProvider } from "@/context/BooksContext";
import { getAllBooks } from "@/actions/books";
import { getSession } from "@/lib/session";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/InstallPrompt";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bookeeper",
  description: "Sua biblioteca pessoal de livros",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bookeeper",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession().catch(() => null);
  const books = await getAllBooks().catch(() => []);

  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <BooksProvider key={session?.userId ?? "guest"} initialBooks={books}>
          {children}
          <InstallPrompt />
        </BooksProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
