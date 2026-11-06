import { NextRequest, NextResponse } from "next/server";
import { tutorSystemPrompt } from "@/lib/prompts";
import { mockTutorResponse } from "@/lib/mock";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = "English", exam = "JEE", topic = "", chapter = "", mode = "teach", imageBase64, userMessage } = body;

    const apiKey = req.headers.get("x-gemini-key") || req.headers.get("x-openai-key") || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
    const geminiKey = req.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY || "";

    // If no API key, return mock immediately
    if (!geminiKey && !apiKey) {
      await new Promise((r) => setTimeout(r, 600));
      const mock = mockTutorResponse(topic || chapter || userMessage || "Projectile Motion", language);
      // Personalize with user message context if provided
      if (userMessage) {
        const lower = userMessage.toLowerCase();
        if (lower.includes("simpler") || lower.includes("explain differently") || lower.includes("easy")) {
          mock.board_blocks[0].content = `**Simpler Analogy:** Soch lo ek auto rickshaw jo samandar kinare chal raha hai — horizontal speed steady hai, par gravity use neeche kheench rahi hai. ${mock.board_blocks[0].content}`;
          mock.spoken_script = `Okay, let me make it super simple — think of an auto moving steadily forward while gravity gently pulls it down. That's exactly why the path curves into a parabola!`;
          mock.board_title = "Simpler Take: " + mock.board_title;
        }
      }
      return NextResponse.json(mock);
    }

    // Try Gemini API
    if (geminiKey) {
      try {
        const systemPrompt = tutorSystemPrompt(language, exam);
        const contents: any[] = [];
        // Add system as first user message for Gemini
        const history = messages || [];
        // Build prompt
        const lastUser = userMessage || (history.length ? history[history.length - 1]?.content : topic) || "Teach me " + (topic || chapter);

        // If image provided, include vision
        const parts: any[] = [{ text: systemPrompt + "\n\nUser request: " + lastUser + "\n\nTopic context: " + (topic || chapter) + "\nMode: " + mode + "\nRemember to return ONLY valid JSON with board_title, board_blocks, spoken_script, checkpoint_question." }];

        if (imageBase64) {
          // imageBase64 is data URL or base64; extract mime and data
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

        // Add conversation history as context (truncated)
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

        // Try parse JSON
        let parsed: any;
        try {
          // Remove code fences if present
          const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
          parsed = JSON.parse(cleaned);
        } catch (e) {
          console.error("JSON parse failed, raw:", text);
          // Fallback to mock with Gemini text as spoken script
          const mock = mockTutorResponse(topic || chapter || "Topic", language);
          mock.spoken_script = text.slice(0, 400);
          mock.board_blocks[0].content = text.slice(0, 800);
          return NextResponse.json(mock);
        }

        // Ensure required fields
        if (!parsed.board_title) parsed.board_title = topic || "Lesson";
        if (!parsed.board_blocks) parsed.board_blocks = [{ type: "concept", content: parsed.spoken_script || "Let's learn!" }];
        if (!parsed.spoken_script) parsed.spoken_script = "Let's explore this concept step by step.";

        return NextResponse.json(parsed);
      } catch (err: any) {
        console.error("Gemini call failed, falling back to mock", err);
        const mock = mockTutorResponse(topic || chapter || userMessage || "Topic", language);
        return NextResponse.json(mock);
      }
    }

    // OpenAI fallback if no Gemini but have OpenAI key
    return NextResponse.json(mockTutorResponse(topic || chapter || userMessage || "Topic", language));
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
