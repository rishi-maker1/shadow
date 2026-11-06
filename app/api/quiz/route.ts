import { NextRequest, NextResponse } from "next/server";
import { quizSystemPrompt } from "@/lib/prompts";
import { mockQuiz } from "@/lib/mock";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chapter = "Kinematics", exam = "JEE", count = 5 } = body;
    const geminiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

    if (!geminiKey) {
      await new Promise((r) => setTimeout(r, 700));
      return NextResponse.json(mockQuiz(chapter, count));
    }

    try {
      const prompt = quizSystemPrompt(chapter, exam, count);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 3000, responseMimeType: "application/json" },
        }),
      });
      if (!res.ok) throw new Error(`Gemini quiz error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response");
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Invalid questions");
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("Quiz Gemini failed, mock fallback", err);
      return NextResponse.json(mockQuiz(chapter, count));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
