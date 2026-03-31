import { NextResponse } from "next/server";

export interface GoogleBookData {
  title?: string;
  subtitle?: string;
  authors?: string[];
  categories?: string[];
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  description?: string;
  previewLink?: string;
  buyLink?: string;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await params;
  const clean = isbn.replace(/[^0-9Xx]/g, "");

  if (clean.length !== 10 && clean.length !== 13) {
    return NextResponse.json(
      { error: "ISBN inválido. Deve ter 10 ou 13 dígitos." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}${
    apiKey ? `&key=${apiKey}` : ""
  }`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 86400 } });
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

  if (!data.totalItems || !data.items?.[0]) {
    return NextResponse.json(
      { error: "Livro não encontrado para este ISBN." },
      { status: 404 }
    );
  }

  const item = data.items[0];
  const info = item.volumeInfo as GoogleBookData;

  // Google returns http:// for imageLinks — upgrade to https to avoid mixed content
  if (info.imageLinks) {
    if (info.imageLinks.thumbnail)
      info.imageLinks.thumbnail = info.imageLinks.thumbnail.replace(/^http:\/\//, "https://");
    if (info.imageLinks.smallThumbnail)
      info.imageLinks.smallThumbnail = info.imageLinks.smallThumbnail.replace(/^http:\/\//, "https://");
  }

  if (info.previewLink)
    info.previewLink = info.previewLink.replace(/^http:\/\//, "https://");

  // buyLink comes from saleInfo, not volumeInfo
  if (item.saleInfo?.buyLink) info.buyLink = item.saleInfo.buyLink;

  return NextResponse.json(info);
}
