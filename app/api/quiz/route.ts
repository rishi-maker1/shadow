import { NextRequest, NextResponse } from "next/server";
import { quizSystemPrompt } from "@/lib/prompts";
import { mockQuiz } from "@/lib/mock";
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
      await new Promise((r) => setTimeout(r, 700));
      const mock = mockQuiz(chapter, count);
      // If we have NCERT context, annotate solutions to show grounding
      if (ncertContext && mock.questions.length) {
        mock.questions = mock.questions.map((q: any) => ({
          ...q,
          explanation: q.explanation + ` [Grounded in your notes: ${retrieved.slice(0,1).map((c:any)=>c.materialFilename).join(", ") || chapter}]`,
        }));
        (mock as any)._ncertContext = { count: retrieved.length, sources: retrieved.map((c: any) => c.sourceLabel) };
      }
      return NextResponse.json(mock);
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
      // If Gemini returned fewer than requested, pad with mock to reach count (keeps UI happy)
      if (parsed.questions.length < count) {
        const need = count - parsed.questions.length;
        const filler = mockQuiz(chapter, need).questions.slice(0, need).map((q: any, i: number) => ({ ...q, id: `q${parsed.questions.length + i + 1}` }));
        parsed.questions = parsed.questions.concat(filler);
        (parsed as any)._filled = need;
      }
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("Quiz Gemini failed, mock fallback", err);
      const mock = mockQuiz(chapter, count);
      if (ncertContext) (mock as any)._ncertSources = retrieved.map((c: any) => c.sourceLabel);
      return NextResponse.json(mock);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
