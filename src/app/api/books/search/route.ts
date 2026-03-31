import { NextResponse } from "next/server";
import type { GoogleBookData } from "@/app/api/isbn/[isbn]/route";

export interface BookSearchResult extends GoogleBookData {
  id: string;
}

function upgradeHttps(url?: string) {
  return url?.replace(/^http:\/\//, "https://");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim() ?? "";
  const author = searchParams.get("author")?.trim() ?? "";

  if (!title && !author) {
    return NextResponse.json(
      { error: "Informe pelo menos um título ou autor." },
      { status: 400 }
    );
  }

  const parts: string[] = [];
  if (title) parts.push(`intitle:${title}`);
  if (author) parts.push(`inauthor:${author}`);
  const q = parts.join("+");

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&langRestrict=pt${
    apiKey ? `&key=${apiKey}` : ""
  }`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível contactar o Google Books." },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Erro na API do Google Books." },
      { status: 502 }
    );
  }

  const data = await res.json();

  if (!data.totalItems || !data.items?.length) {
    return NextResponse.json({ results: [] });
  }

  const results: BookSearchResult[] = data.items.map((item: {
    id: string;
    volumeInfo: GoogleBookData;
    saleInfo?: { buyLink?: string };
  }) => {
    const info: BookSearchResult = { ...item.volumeInfo, id: item.id };

    if (info.imageLinks) {
      info.imageLinks.thumbnail = upgradeHttps(info.imageLinks.thumbnail);
      info.imageLinks.smallThumbnail = upgradeHttps(info.imageLinks.smallThumbnail);
    }
    if (info.previewLink) info.previewLink = upgradeHttps(info.previewLink);
    if (item.saleInfo?.buyLink) info.buyLink = item.saleInfo.buyLink;

    return info;
  });

  return NextResponse.json({ results });
}
