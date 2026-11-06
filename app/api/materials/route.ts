import { NextRequest, NextResponse } from "next/server";
import { loadMaterials, saveMaterials, createMaterialChunks, extractPdfText } from "@/lib/materials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET -> list materials (without full chunks for lightness, but include chunk previews)
export async function GET() {
  try {
    const materials = loadMaterials();
    // return summarized
    const summarized = materials.map(m => ({
      id: m.id,
      title: m.title,
      filename: m.filename,
      type: m.type,
      exam: m.exam,
      subject: m.subject,
      chapter: m.chapter,
      charCount: m.charCount,
      chunkCount: m.chunks.length,
      createdAt: m.createdAt,
      preview: m.text.slice(0, 280),
    }));
    return NextResponse.json({ materials: summarized, total: summarized.length, totalChunks: materials.reduce((a, m) => a + m.chunks.length, 0) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST -> upload material
// Body: { title?, filename, type?, exam, subject, chapter, contentBase64?, markdownText?, text? }
// For PDF: contentBase64 is base64 of file; for markdown: markdownText or contentBase64 decoded as utf8
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, filename, exam = "JEE", subject = "", chapter = "", type, contentBase64, markdownText, text } = body;

    if (!filename && !title) {
      return NextResponse.json({ error: "filename or title required" }, { status: 400 });
    }

    let extractedText = "";
    let detectedType: "pdf" | "markdown" | "text" = "text";

    const lowerName = (filename || "").toLowerCase();
    const isPdf = lowerName.endsWith(".pdf") || type === "pdf";
    const isMd = lowerName.endsWith(".md") || lowerName.endsWith(".markdown") || type === "markdown";

    if (isPdf) {
      detectedType = "pdf";
      if (!contentBase64) return NextResponse.json({ error: "contentBase64 required for PDF" }, { status: 400 });
      // contentBase64 may be data URL
      let b64 = contentBase64;
      if (b64.startsWith("data:")) {
        const idx = b64.indexOf("base64,");
        if (idx !== -1) b64 = b64.slice(idx + 7);
      }
      const buffer = Buffer.from(b64, "base64");
      if (buffer.length > 12 * 1024 * 1024) {
        return NextResponse.json({ error: "PDF too large (>12 MB). Split the PDF or upload fewer pages." }, { status: 400 });
      }
      extractedText = await extractPdfText(buffer);
      if (!extractedText || extractedText.trim().length < 20) {
        return NextResponse.json({ error: "Could not extract text from PDF. It may be scanned images (no text layer). Try exporting as text-based PDF or upload notes as Markdown." }, { status: 400 });
      }
    } else if (isMd || markdownText || lowerName.endsWith(".txt") || lowerName.endsWith(".tex")) {
      detectedType = isMd ? "markdown" : "text";
      if (markdownText) extractedText = markdownText;
      else if (text) extractedText = text;
      else if (contentBase64) {
        let b64 = contentBase64;
        if (b64.startsWith("data:")) {
          const idx = b64.indexOf("base64,");
          if (idx !== -1) b64 = b64.slice(idx + 7);
        }
        extractedText = Buffer.from(b64, "base64").toString("utf-8");
      } else {
        return NextResponse.json({ error: "No text content provided for markdown/text" }, { status: 400 });
      }
    } else {
      // generic text
      if (text) {
        extractedText = text;
        detectedType = "text";
      } else if (markdownText) {
        extractedText = markdownText;
        detectedType = "markdown";
      } else if (contentBase64) {
        let b64 = contentBase64;
        if (b64.startsWith("data:")) {
          const idx = b64.indexOf("base64,");
          if (idx !== -1) b64 = b64.slice(idx + 7);
        }
        // try utf8 decode
        try {
          extractedText = Buffer.from(b64, "base64").toString("utf-8");
          // detect if it's pdf binary accidentally
          if (extractedText.startsWith("%PDF")) {
            return NextResponse.json({ error: "File appears to be PDF but type not set to pdf. Please name it .pdf" }, { status: 400 });
          }
          detectedType = "text";
        } catch {
          return NextResponse.json({ error: "Cannot decode base64 text" }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: "Unsupported file type. Upload PDF or Markdown (.md/.txt)" }, { status: 400 });
      }
    }

    extractedText = extractedText.trim();
    if (extractedText.length < 30) {
      return NextResponse.json({ error: "Extracted text too short (<30 chars). Upload richer notes." }, { status: 400 });
    }
    if (extractedText.length > 500_000) {
      extractedText = extractedText.slice(0, 500_000);
    }

    const materials = loadMaterials();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const titleFinal = (title || filename || `Notes ${new Date().toLocaleDateString()}`).trim().slice(0, 120);
    const chunks = createMaterialChunks(id, extractedText);

    const newMat = {
      id,
      title: titleFinal,
      filename: filename || titleFinal,
      type: detectedType,
      exam: (exam || "JEE").toString().slice(0, 20),
      subject: (subject || "").toString().slice(0, 80),
      chapter: (chapter || "").toString().slice(0, 120),
      text: extractedText,
      chunks,
      createdAt: Date.now(),
      charCount: extractedText.length,
    };

    materials.unshift(newMat);
    saveMaterials(materials);

    return NextResponse.json({
      success: true,
      material: {
        id: newMat.id,
        title: newMat.title,
        filename: newMat.filename,
        type: newMat.type,
        exam: newMat.exam,
        subject: newMat.subject,
        chapter: newMat.chapter,
        charCount: newMat.charCount,
        chunkCount: chunks.length,
        createdAt: newMat.createdAt,
        preview: extractedText.slice(0, 400),
      },
      total: materials.length,
    });
  } catch (e: any) {
    console.error("POST /api/materials", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}

// DELETE -> ?id=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const materials = loadMaterials();
    const idx = materials.findIndex(m => m.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    materials.splice(idx, 1);
    saveMaterials(materials);
    return NextResponse.json({ success: true, total: materials.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
