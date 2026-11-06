import { NextRequest, NextResponse } from "next/server";
import { visionSystemPrompt } from "@/lib/prompts";
import { mockVisionResponse } from "@/lib/mock";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, questionText = "", language = "English", exam = "JEE" } = body;
    const geminiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

    if (!geminiKey) {
      await new Promise((r) => setTimeout(r, 800));
      const mock = mockVisionResponse();
      if (questionText) mock.extracted_problem = questionText;
      return NextResponse.json(mock);
    }

    try {
      const systemPrompt = visionSystemPrompt(language);
      const parts: any[] = [{ text: systemPrompt + `\n\nExam: ${exam}\nUser typed doubt: ${questionText || "(no text, only image)"}\nExtract and teach step-by-step. Return JSON only.` }];

      if (imageBase64) {
        let base64Data = imageBase64;
        let mimeType = "image/jpeg";
        if (imageBase64.startsWith("data:")) {
          const match = imageBase64.match(/^data:(.*?);base64,(.*)$/);
          if (match) {
            mimeType = match[1];
            base64Data = match[2];
          }
        }
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2500, responseMimeType: "application/json" },
        }),
      });
      if (!res.ok) throw new Error(`Gemini vision error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty vision response");
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("Vision Gemini failed", err);
      const mock = mockVisionResponse();
      if (questionText) mock.extracted_problem = questionText;
      return NextResponse.json(mock);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
