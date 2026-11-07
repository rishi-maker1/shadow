import { NextRequest, NextResponse } from "next/server";
import { quizSystemPrompt } from "@/lib/prompts";
import { retrieveRelevantChunks, formatChunksForPrompt } from "@/lib/materials";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chapter = "Kinematics", exam = "JEE", subject = "", count = 5 } = body;
    const geminiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

    // Retrieve NCERT context for quiz grounding
    let ncertContext = "";
    let retrieved: any[] = [];
    try {
      retrieved = retrieveRelevantChunks(chapter + " " + (subject || ""), { exam, subject, chapter, topK: 3 });
      if (retrieved.length) ncertContext = formatChunksForPrompt(retrieved);
    } catch {}

    if (!geminiKey) {
      return NextResponse.json({ error: "shadow requires GEMINI_API_KEY for live quiz generation — add it in .env or ⚙️ Settings. No demo mocks (per user request)." }, { status: 503 });
    }

    try {
      const prompt = quizSystemPrompt(chapter, exam, count, ncertContext);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: Math.min(8192, Math.max(3000, count * 260)), responseMimeType: "application/json" },
        }),
      });
      if (!res.ok) throw new Error(`Gemini quiz error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response");
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      // handle large responses that may be truncated: try parse, if fails truncate gracefully
      let parsed: any;
      try { parsed = JSON.parse(cleaned); } catch { throw new Error("Invalid JSON - likely token limit; try fewer questions (≤30) or retry"); }
      if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Invalid questions");
      if (retrieved.length) (parsed as any)._ncertSources = retrieved.map((c: any) => c.sourceLabel);
      // no mock filler — return exactly what Gemini gave (live only)
      return NextResponse.json(parsed);
    } catch (err: any) {
      console.error("Quiz Gemini failed", err);
      return NextResponse.json({ error: `Quiz generation failed: ${err.message || err} — check GEMINI_API_KEY` }, { status: 502 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
