import fs from "fs";
import path from "path";

// Server-side only file persistence for study materials
// Also works in dev with fallback to in-memory if fs not available (e.g., edge)

export interface MaterialChunk {
  id: string;
  materialId: string;
  text: string;
  index: number;
  tokenCount: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  filename: string;
  type: "pdf" | "markdown" | "text";
  exam: string; // JEE, NEET, CBSE10, CBSE12 or custom
  subject: string;
  chapter: string;
  text: string; // full extracted text
  chunks: MaterialChunk[];
  createdAt: number;
  charCount: number;
  sourceHash?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "materials.json");

// In-memory cache for fast retrieval (mirrors file)
let memCache: StudyMaterial[] | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  } catch {}
}

export function loadMaterials(): StudyMaterial[] {
  if (memCache) return memCache;
  ensureDataDir();
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) {
      memCache = parsed;
      return parsed;
    }
    return [];
  } catch (e) {
    console.error("loadMaterials error", e);
    return memCache || [];
  }
}

export function saveMaterials(materials: StudyMaterial[]) {
  memCache = materials;
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(materials, null, 2), "utf-8");
  } catch (e) {
    console.error("saveMaterials error", e);
  }
}

export function clearCache() {
  memCache = null;
}

// ---------- Chunking ----------

const STOPWORDS = new Set([
  "the","is","are","was","were","be","been","being","a","an","of","to","in","on","for","with","by","and","or","as","at","from","that","this","it","its","it’s","which","who","whom","what","when","where","why","how","if","then","than","so","but","not","no","yes","can","will","also","are","has","have","had","do","does","did","we","you","they","our","your","their","he","she","his","her","its","i","me","my","mine","us"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOPWORDS.has(w));
}

export function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    // Try to break at paragraph / sentence boundary
    if (end < clean.length) {
      const slice = clean.slice(start, end);
      const lastDoubleNl = slice.lastIndexOf("\n\n");
      const lastPeriod = slice.lastIndexOf(". ");
      const lastNl = slice.lastIndexOf("\n");
      let breakAt = -1;
      if (lastDoubleNl > chunkSize * 0.5) breakAt = lastDoubleNl;
      else if (lastPeriod > chunkSize * 0.6) breakAt = lastPeriod + 1;
      else if (lastNl > chunkSize * 0.5) breakAt = lastNl;
      if (breakAt !== -1) end = start + breakAt + 1;
    }
    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= clean.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}

export function createMaterialChunks(materialId: string, text: string): MaterialChunk[] {
  const rawChunks = chunkText(text);
  return rawChunks.map((t, idx) => ({
    id: `${materialId}-c${idx}`,
    materialId,
    text: t,
    index: idx,
    tokenCount: t.split(/\s+/).length,
  }));
}

// ---------- Retrieval (lexical + metadata boost) ----------

export interface ScoredChunk extends MaterialChunk {
  score: number;
  materialTitle: string;
  materialFilename: string;
  exam: string;
  subject: string;
  chapter: string;
  sourceLabel: string;
}

export function retrieveRelevantChunks(query: string, opts?: { exam?: string; subject?: string; chapter?: string; topK?: number; examBoost?: boolean }): ScoredChunk[] {
  const materials = loadMaterials();
  if (!materials.length || !query?.trim()) return [];

  const topK = opts?.topK ?? 4;
  const qTokens = new Set(tokenize(query));
  const qLower = query.toLowerCase();
  const qWords = qLower.split(/\s+/).filter(Boolean);
  const examFilter = opts?.exam?.toLowerCase();
  const chapFilter = opts?.chapter?.toLowerCase();
  const subjFilter = opts?.subject?.toLowerCase();

  const scored: ScoredChunk[] = [];

  for (const mat of materials) {
    const examMatch = examFilter && mat.exam.toLowerCase() === examFilter;
    const chapMatch = chapFilter && mat.chapter.toLowerCase().includes(chapFilter);
    const chapExact = chapFilter && mat.chapter.toLowerCase() === chapFilter;
    const subjMatch = subjFilter && mat.subject.toLowerCase().includes(subjFilter);

    // Bonus for exact exam/chapter match - prefer same chapter material
    const matBoost = (examMatch ? 2.5 : 0) + (chapExact ? 4 : chapMatch ? 2 : 0) + (subjMatch ? 1 : 0);

    for (const chunk of mat.chunks) {
      const chunkTokens = tokenize(chunk.text);
      const chunkTokenSet = new Set(chunkTokens);
      let overlap = 0;
      for (const tok of qTokens) if (chunkTokenSet.has(tok)) overlap += 1;

      // TF style: overlap normalized by query size + length penalty
      const overlapScore = qTokens.size ? (overlap / qTokens.size) * 10 : 0;

      // Bonus for exact phrase substrings
      let phraseBonus = 0;
      for (const w of qWords) if (w.length >= 4 && chunk.text.toLowerCase().includes(w)) phraseBonus += 0.4;
      // Big bonus if whole chapter phrase appears
      if (chapFilter && chunk.text.toLowerCase().includes(chapFilter)) phraseBonus += 1.5;

      // Length sanity: penalize very tiny chunks
      const lengthFactor = Math.min(1, chunk.text.length / 400);

      // Total
      const base = overlapScore + phraseBonus;
      // If no overlap at all but material boost exists, still allow if chapter matches exactly -> give small score
      const total = (base * lengthFactor) + matBoost * 0.6 + (base > 0 ? matBoost : 0);

      if (total > 0.3) {
        scored.push({
          ...chunk,
          score: total,
          materialTitle: mat.title,
          materialFilename: mat.filename,
          exam: mat.exam,
          subject: mat.subject,
          chapter: mat.chapter,
          sourceLabel: `${mat.filename}#chunk-${chunk.index}`,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  // Deduplicate near-identical top chunks (if same material consecutive)
  const deduped: ScoredChunk[] = [];
  const seenText = new Set<string>();
  for (const s of scored) {
    const key = s.text.slice(0, 80);
    if (seenText.has(key)) continue;
    seenText.add(key);
    deduped.push(s);
    if (deduped.length >= topK) break;
  }
  return deduped;
}

export function formatChunksForPrompt(chunks: ScoredChunk[]): string {
  if (!chunks.length) return "";
  return chunks
    .map((c, i) => {
      return `[Source ${i + 1}: "${c.materialTitle}" (${c.materialFilename}) — ${c.exam} / ${c.subject} / ${c.chapter} — chunk ${c.index} | score ${c.score.toFixed(2)}]\n${c.text.trim()}\n`;
    })
    .join("\n---\n\n");
}

// Utility: extract text from PDF buffer on server using pdf-parse
export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse is a CommonJS that exports a function; dynamic require to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return (data.text || "").trim();
  } catch (e: any) {
    console.error("pdf-parse failed", e?.message);
    throw new Error("PDF extraction failed: " + (e?.message || "unknown"));
  }
}
