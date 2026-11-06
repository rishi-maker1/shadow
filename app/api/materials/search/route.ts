import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantChunks, formatChunksForPrompt } from "@/lib/materials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query = "", exam, subject, chapter, topK = 4 } = body;
    if (!query.trim()) return NextResponse.json({ error: "query required" }, { status: 400 });
    const chunks = retrieveRelevantChunks(query, { exam, subject, chapter, topK });
    return NextResponse.json({
      query,
      count: chunks.length,
      chunks: chunks.map(c => ({
        text: c.text,
        score: c.score,
        sourceLabel: c.sourceLabel,
        materialTitle: c.materialTitle,
        materialFilename: c.materialFilename,
        exam: c.exam,
        subject: c.subject,
        chapter: c.chapter,
        index: c.index,
      })),
      formatted: formatChunksForPrompt(chunks),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const exam = searchParams.get("exam") || undefined;
  const chapter = searchParams.get("chapter") || undefined;
  const subject = searchParams.get("subject") || undefined;
  const topK = parseInt(searchParams.get("topK") || "4", 10);
  if (!query) return NextResponse.json({ error: "q required" }, { status: 400 });
  const chunks = retrieveRelevantChunks(query, { exam, subject, chapter, topK });
  return NextResponse.json({ query, count: chunks.length, chunks });
}
