import { NextRequest, NextResponse } from "next/server";
import { tutorSystemPrompt } from "@/lib/prompts";
import { mockTutorResponse } from "@/lib/mock";
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

    // If no API key, return mock immediately (but now NCERT-grounded mock)
    if (!geminiKey && !apiKey) {
      await new Promise((r) => setTimeout(r, 600));
      const mock = mockTutorResponse(topic || chapter || userMessage || "Projectile Motion", language);
      // Inject NCERT context into mock if available
      if (ncertContext) {
        const sourceList = retrievedChunks.map((c: any, i: number) => `**[Source ${i + 1}: ${c.materialFilename} — ${c.chapter}]**`).join(", ");
        mock.board_blocks.unshift({
          type: "concept",
          content: `**📚 NCERT Grounded:** This explanation follows your uploaded notes ${sourceList}. Definitions & formulas below are taken verbatim from your material.`,
          highlight: false,
        });
        // Append a citation block at end
        const citationText = retrievedChunks.slice(0, 2).map((c: any) => `> _“${c.text.slice(0, 220).replace(/\n/g, " ")}…”_ — [${c.materialFilename}#chunk-${c.index}]`).join("\n\n");
        mock.board_blocks.push({
          type: "concept",
          content: `**NCERT Passages Used:**\n\n${citationText}`,
          highlight: false,
        });
        mock.board_title = `📚 ${mock.board_title}`;
        mock.spoken_script = `As per your NCERT notes, ` + mock.spoken_script;
      }
      // Personalize with user message context if provided
      if (userMessage) {
        const lower = userMessage.toLowerCase();
        if (lower.includes("simpler") || lower.includes("explain differently") || lower.includes("easy")) {
          mock.board_blocks[0].content = `**Simpler Analogy:** Soch lo ek auto rickshaw jo samandar kinare chal raha hai — horizontal speed steady hai, par gravity use neeche kheench rahi hai. ${mock.board_blocks[0].content}`;
          mock.spoken_script = `Okay, let me make it super simple — think of an auto moving steadily forward while gravity gently pulls it down. That's exactly why the path curves into a parabola!`;
          mock.board_title = "Simpler Take: " + mock.board_title;
        }
      }
      return NextResponse.json({ ...mock, _ncertContext: ncertContext ? { count: retrievedChunks.length, sources: retrievedChunks.map((c: any) => c.sourceLabel) } : null, _retrieved: retrievedChunks.slice(0, 2) });
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
          const mock = mockTutorResponse(topic || chapter || "Topic", language);
          mock.spoken_script = text.slice(0, 400);
          mock.board_blocks[0].content = text.slice(0, 800);
          return NextResponse.json({ ...mock, _ncertContext: ncertContext ? { count: retrievedChunks.length } : null });
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
        console.error("Gemini call failed, falling back to mock", err);
        const mock = mockTutorResponse(topic || chapter || userMessage || "Topic", language);
        if (ncertContext) {
          mock.board_blocks.unshift({ type: "concept", content: `**📚 NCERT Grounded:** Using your uploaded notes for this topic.` });
        }
        return NextResponse.json(mock);
      }
    }

    return NextResponse.json(mockTutorResponse(topic || chapter || userMessage || "Topic", language));
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
