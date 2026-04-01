import { NextResponse } from "next/server";
import type { GoogleBookData } from "@/app/api/isbn/[isbn]/route";
import type { ExploreBook } from "@/app/api/books/explore/route";

function upgradeHttps(url?: string): string {
  return url?.replace(/^http:\/\//, "https://") ?? "";
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}${
    apiKey ? `?key=${apiKey}` : ""
  }`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 3600 } });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível contactar o Google Books." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Livro não encontrado." },
      { status: res.status }
    );
  }

  const item = await res.json() as {
    id: string;
    volumeInfo: GoogleBookData & { description?: string };
    saleInfo?: { buyLink?: string };
  };

  const v = item.volumeInfo;

  const book: ExploreBook = {
    id: item.id,
    title: v.title ?? "Sem título",
    author: v.authors?.[0] ?? "Autor desconhecido",
    coverUrl: upgradeHttps(
      v.imageLinks?.thumbnail ?? v.imageLinks?.smallThumbnail
    ),
    categories: v.categories ?? [],
    publisher: v.publisher ?? "",
    publishedDate: v.publishedDate ?? "",
    pageCount: v.pageCount ?? null,
    description: v.description ?? "",
    buyLink: upgradeHttps(item.saleInfo?.buyLink),
    previewLink: upgradeHttps(v.previewLink),
  };

  return NextResponse.json({ book });
}
