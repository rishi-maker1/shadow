import { NextRequest, NextResponse } from "next/server";
import { tutorSystemPrompt } from "@/lib/prompts";
import { retrieveRelevantChunks, formatChunksForPrompt } from "@/lib/materials";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = "English", exam = "JEE", topic = "", chapter = "", subject = "", mode = "teach", imageBase64, userMessage } = body;

    const apiKey = req.headers.get("x-gemini-key") || req.headers.get("x-openai-key") || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
    const geminiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

    // Retrieve NCERT grounded passages (always, even for mock)
    const queryForRetrieval = [topic, chapter, subject, userMessage].filter(Boolean).join(" ") || topic || chapter || userMessage || "general";
    let retrievedChunks: any[] = [];
    let ncertContext = "";
    try {
      retrievedChunks = retrieveRelevantChunks(queryForRetrieval, { exam, subject, chapter: chapter || topic, topK: 4 });
      if (retrievedChunks.length) ncertContext = formatChunksForPrompt(retrievedChunks);
    } catch (e) {
      console.error("retrieval failed", e);
    }

    // shadow — LIVE ONLY (no demo fallback as per user request). Require Gemini key for true JEET AI duplicate.
    if (!geminiKey && !apiKey) {
      return NextResponse.json({ error: "shadow requires GEMINI_API_KEY — add it in .env (GEMINI_API_KEY=...) or via ⚙️ Settings on the app. No demo/mocks — this is a live JEET AI duplicate." }, { status: 503 });
    }

    // Try Gemini API
    if (geminiKey) {
      try {
        const systemPrompt = tutorSystemPrompt(language, exam, ncertContext);
        const contents: any[] = [];
        const history = messages || [];
        const lastUser = userMessage || (history.length ? history[history.length - 1]?.content : topic) || "Teach me " + (topic || chapter);

        const parts: any[] = [{ text: systemPrompt + "\n\nUser request: " + lastUser + "\n\nTopic context: " + (topic || chapter) + " | Subject: " + (subject || "") + " | Mode: " + mode + "\nRemember to return ONLY valid JSON with board_title, board_blocks, spoken_script, checkpoint_question." }];

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

        if (history.length > 1) {
          const historyText = history.slice(-6).map((m: any) => `${m.role}: ${m.content}`).join("\n");
          parts[0].text += `\n\nConversation history:\n${historyText}`;
        }

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: "application/json" },
          }),
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.error("Gemini error", errText);
          throw new Error(`Gemini API error: ${geminiRes.status}`);
        }

        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty Gemini response");

        let parsed: any;
        try {
          const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
          parsed = JSON.parse(cleaned);
        } catch (e) {
          console.error("JSON parse failed, raw:", text);
          return NextResponse.json({ error: "Gemini returned invalid JSON — retry. Raw: " + text.slice(0, 800) }, { status: 502 });
        }

        if (!parsed.board_title) parsed.board_title = topic || "Lesson";
        if (!parsed.board_blocks) parsed.board_blocks = [{ type: "concept", content: parsed.spoken_script || "Let's learn!" }];
        if (!parsed.spoken_script) parsed.spoken_script = "Let's explore this concept step by step.";

        // Attach NCERT provenance if available
        if (retrievedChunks.length && !parsed._ncertSources) {
          parsed._ncertSources = retrievedChunks.map((c: any) => c.sourceLabel);
        }

        return NextResponse.json(parsed);
      } catch (err: any) {
        console.error("Gemini call failed", err);
        return NextResponse.json({ error: `Gemini failed: ${err.message || err} — check your GEMINI_API_KEY and quota at aistudio.google.com/app/apikey` }, { status: 502 });
      }
    }

return NextResponse.json({ error: "No Gemini key and no fallback — shadow is live-only" }, { status: 503 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
