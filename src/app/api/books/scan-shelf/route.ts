import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ScannedBook {
  title: string;
  author: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key não configurada." },
      { status: 500 }
    );
  }

  let imageFile: File;
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Imagem não enviada." }, { status: 400 });
    }
    imageFile = file;
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar a imagem." },
      { status: 400 }
    );
  }

  const arrayBuffer = await imageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

  const prompt = `Você é um especialista em identificar livros. Analise esta foto de uma estante de livros.
Identifique todos os livros que você conseguir ver com clareza, lendo os títulos nas lombadas ou capas.
Retorne APENAS um array JSON válido, sem nenhum texto adicional antes ou depois, no seguinte formato:
[{"title": "título do livro", "author": "nome do autor se visível, caso contrário string vazia"}]
Inclua apenas livros que você consegue identificar com boa confiança. Não invente títulos.
Se não conseguir identificar nenhum livro, retorne um array vazio: []`;

  let text: string;
  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType } },
    ]);
    text = result.response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[scan-shelf] Gemini error:", message);
    return NextResponse.json(
      { error: `Erro ao analisar a imagem com IA: ${message}` },
      { status: 502 }
    );
  }

  let books: ScannedBook[] = [];
  try {
    // Strip markdown code fences that Gemini sometimes adds
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) {
      books = parsed
        .filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.title === "string" &&
            item.title.trim()
        )
        .map((item) => ({
          title: item.title.trim(),
          author: typeof item.author === "string" ? item.author.trim() : "",
        }));
    }
  } catch {
    return NextResponse.json(
      { error: "Resposta inesperada da IA. Tente novamente." },
      { status: 502 }
    );
  }

  return NextResponse.json({ books });
}
