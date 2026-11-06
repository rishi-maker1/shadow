"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { SYLLABUS, Exam } from "@/lib/syllabus";
import { getSelectedExam } from "@/lib/storage";
import {
  BookMarked, Upload, FileText, File, Trash2, Search, Sparkles, CheckCircle2, AlertCircle, Loader2,
  BookOpen, Layers, Clock, Eye, X, FileUp, Database, Filter, ClipboardCheck, GraduationCap
} from "lucide-react";

interface MaterialSummary {
  id: string;
  title: string;
  filename: string;
  type: string;
  exam: string;
  subject: string;
  chapter: string;
  charCount: number;
  chunkCount: number;
  createdAt: number;
  preview: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialSummary[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [title, setTitle] = useState("");
  const [exam, setExam] = useState<Exam>("JEE");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [markdownText, setMarkdownText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search demo
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExam, setSearchExam] = useState("");
  const [searchChapter, setSearchChapter] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected material detail
  const [selected, setSelected] = useState<MaterialSummary | null>(null);
  const [detailChunks, setDetailChunks] = useState<any[]>([]);

  useEffect(() => {
    const saved = getSelectedExam() as Exam;
    if (saved) setExam(saved);
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      if (data.materials) {
        setMaterials(data.materials);
        setTotalChunks(data.totalChunks || 0);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    // auto-fill title if empty
    if (!title) setTitle(f.name.replace(/\.(pdf|md|markdown|txt)$/i, ""));
    // auto-detect type
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "md" || ext === "markdown") {
      const reader = new FileReader();
      reader.onload = () => setMarkdownText(reader.result as string);
      reader.readAsText(f);
    } else {
      setMarkdownText("");
    }
    setError("");
    setSuccess("");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file && !markdownText.trim()) {
      setError("Please select a PDF/Markdown file or paste markdown text.");
      return;
    }
    if (!chapter.trim() && !subject.trim()) {
      setError("Please enter at least Chapter (e.g., 'Electrostatics') so retrieval can match correctly.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      let contentBase64: string | undefined;
      let mdText: string | undefined;

      if (file) {
        // Check size 12 MB
        if (file.size > 12 * 1024 * 1024) throw new Error("File too large (>12 MB). Split PDF.");
        contentBase64 = await fileToBase64(file);
        // If file is markdown, also send decoded text for faster extraction
        if (file.name.toLowerCase().endsWith(".md") || file.name.toLowerCase().endsWith(".txt")) {
          mdText = markdownText || await file.text();
        }
      } else if (markdownText.trim()) {
        mdText = markdownText.trim();
      }

      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || file?.name || "Untitled Notes",
          filename: file?.name || `${title || "notes"}.md`,
          exam,
          subject,
          chapter,
          type: file?.name.toLowerCase().endsWith(".pdf") ? "pdf" : "markdown",
          contentBase64,
          markdownText: mdText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSuccess(`✓ Uploaded “${data.material.title}” — ${data.material.charCount.toLocaleString()} chars, ${data.material.chunkCount} chunks. Now AI Tutor & Quiz will be strictly grounded in this chapter!`);
      setTitle("");
      setFile(null);
      setMarkdownText("");
      setSubject("");
      setChapter("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMaterials();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material and its chunks? Tutor will no longer be grounded in it.")) return;
    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMaterials(m => m.filter(x => x.id !== id));
      setTotalChunks(c => Math.max(0, c - 1));
      fetchMaterials();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/materials/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, exam: searchExam || undefined, chapter: searchChapter || undefined, topK: 4 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSearchResults(data.chunks || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSearching(false);
    }
  };

  const chaptersForExam = SYLLABUS[exam]?.flatMap(s => s.chapters.map(c => ({ name: c.name, subject: s.subject }))) || [];

  // Quick paste markdown helper
  const loadSampleMarkdown = () => {
    const sample = `# ${chapter || "Electrostatics"} — NCERT Notes (Sample)

## Coulomb's Law (NCERT Class 12, Ch1)
The force between two point charges $q_1$ and $q_2$ separated by distance $r$ in vacuum is:
$$ F = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_1 q_2}{r^2} $$
Direction is along the line joining the charges. Like charges repel, unlike attract.

**Definition (NCERT):** Electric field $E$ at a point due to charge $Q$ is force per unit positive test charge:
$$ \\vec{E} = \\frac{\\vec{F}}{q_0} = \\frac{1}{4\\pi\\varepsilon_0}\\frac{Q}{r^2}\\hat{r} $$

## Gauss's Theorem (NCERT)
Total electric flux through a closed surface is $\\frac{1}{\\varepsilon_0}$ times enclosed charge:
$$ \\oint \\vec{E}\\cdot d\\vec{A} = \\frac{Q_{enc}}{\\varepsilon_0} $$

**Application — Field due to infinite line charge (NCERT Ex 1.9):**
Using cylindrical Gaussian surface, $E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r}$ radially outward.

> This sample demonstrates how your NCERT text will be chunked (~900 chars) and retrieved. Replace with your actual PDF/notes.
`;
    setMarkdownText(sample);
    setTitle(prev => prev || `${chapter || "Sample"} - NCERT Notes`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg"><BookMarked className="w-5 h-5" /></span>
              My Study Material <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900">NCERT & Notes</span>
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl">
              Upload PDF or Markdown chapter notes → server extracts & chunks (≈900 chars, 120 overlap) → retrieves most relevant passages whenever <b>AI Tutor teaches</b> that chapter or <b>generates JEE/NEET questions</b> — so every explanation strictly follows <b>your</b> NCERT definitions, derivations & formulas. No hallucinated formulas vs your notes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-extrabold text-slate-900">{materials.length}</div>
              <div className="text-xs font-semibold text-slate-500">Materials</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-extrabold text-indigo-600">{totalChunks}</div>
              <div className="text-xs font-semibold text-slate-500">Chunks indexed</div>
            </div>
            <div className="hidden sm:flex px-4 py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow text-center">
              <div>
                <div className="text-sm font-bold flex items-center gap-1"><Database className="w-4 h-4" /> Retrieval: lexical</div>
                <div className="text-xs opacity-90">+ exam/chapter boost</div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}
        {success && <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex gap-3"><CheckCircle2 className="w-5 h-5 shrink-0" /> {success}</div>}

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          {/* Upload Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><FileUp className="w-5 h-5 text-indigo-600" /> Upload PDF / Markdown</h2>
              <p className="text-xs text-slate-600 mt-1">PDF is parsed with <code className="px-1 py-0.5 bg-white border rounded">pdf-parse</code> on server; Markdown is chunked directly. Max 12 MB / 500k chars per file.</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Drag drop */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}
              >
                {file ? (
                  <div className="flex items-center gap-4 text-left bg-white rounded-xl border p-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${file.name.toLowerCase().endsWith(".pdf") ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"}`}>
                      {file.name.toLowerCase().endsWith(".pdf") ? <FileText className="w-6 h-6" /> : <File className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{file.name}</div>
                      <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {file.type || "unknown type"}</div>
                      {markdownText && <div className="text-xs text-emerald-700 mt-1">✓ Markdown text extracted ({markdownText.length.toLocaleString()} chars)</div>}
                    </div>
                    <button onClick={() => { setFile(null); setMarkdownText(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto"><Upload className="w-6 h-6" /></div>
                    <p className="font-bold mt-3">Drag & drop PDF or .md here</p>
                    <p className="text-xs text-slate-500 mt-1">or click to browse • Supports scanned PDFs? Needs text layer; image-only PDFs will error — use Markdown instead</p>
                    <input ref={fileInputRef} type="file" accept=".pdf,.md,.markdown,.txt" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }} />
                    <div className="mt-4 flex justify-center gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-black">Browse Files</button>
                      <button onClick={loadSampleMarkdown} className="px-5 py-2.5 rounded-full bg-white border font-semibold">Load Sample Markdown</button>
                    </div>
                  </>
                )}
              </div>

              {/* Metadata form */}
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm">
                  <span className="font-semibold text-slate-700">Title *</span>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., NCERT Class 12 Physics Ch1 - Electric Charges" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-slate-700">Exam</span>
                  <select value={exam} onChange={e => { setExam(e.target.value as Exam); setSubject(""); setChapter(""); }} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                    <option value="JEE">JEE</option>
                    <option value="NEET">NEET</option>
                    <option value="CBSE10">CBSE 10</option>
                    <option value="CBSE12">CBSE 12</option>
                  </select>
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-slate-700">Subject</span>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Physics" list="subject-list" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <datalist id="subject-list">
                    {SYLLABUS[exam]?.map(s => <option key={s.subject} value={s.subject} />)}
                  </datalist>
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-slate-700">Chapter *</span>
                  <input value={chapter} onChange={e => setChapter(e.target.value)} placeholder="e.g., Electrostatics" list="chapter-list" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <datalist id="chapter-list">
                    {chaptersForExam.map(c => <option key={c.name} value={c.name} />)}
                  </datalist>
                  <span className="text-xs text-slate-500">Must match chapter name for exact retrieval (e.g., “Kinematics”, “Electrostatics”)</span>
                </label>
              </div>

              {/* Markdown textarea fallback */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Or paste Markdown / Text directly</label>
                  <span className="text-xs text-slate-500">{markdownText.length.toLocaleString()} chars</span>
                </div>
                <textarea value={markdownText} onChange={e => setMarkdownText(e.target.value)} placeholder="Paste your NCERT notes here (supports KaTeX $...$). If you uploaded a PDF, this is auto-filled; otherwise paste chapter text here..." rows={6} className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-y" />
                <p className="text-xs text-slate-500 mt-1">Tip: Copy from NCERT PDF (text layer) or your handwritten notes typed as Markdown. KaTeX preserved.</p>
              </div>

              <button onClick={handleUpload} disabled={uploading || (!file && !markdownText.trim())} className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {uploading ? "Extracting & Chunking…" : "Upload & Index for AI Tutor"}
              </button>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs leading-relaxed text-amber-800">
                  <b>How grounding works:</b> On every <b>Live Classroom</b> call & <b>Quiz generation</b>, server retrieves <code className="px-1 py-0.5 bg-white rounded border">top 4 chunks</code> by lexical + exam/chapter boost. Prompt includes <code className="px-1 py-0.5 bg-white rounded border">STRICT NCERT CONTEXT</code> — AI must cite <code className="px-1 py-0.5 bg-white rounded border">[Source: filename#chunk]</code> and never contradict your notes.
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: retrieval demo + list */}
          <div className="space-y-6">
            {/* Retrieval Tester */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Search className="w-4 h-4 text-indigo-600" /> Test Retrieval — “Will my Tutor use it?”</h3>
                <p className="text-xs text-slate-500">Simulates what the Tutor does: query + exam/chapter → top passages</p>
              </div>
              <div className="p-5 space-y-4">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g., What is Gauss law? Define electric flux?" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={searchExam} onChange={e => setSearchExam(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
                    <option value="">All exams</option>
                    <option value="JEE">JEE</option><option value="NEET">NEET</option><option value="CBSE12">CBSE12</option><option value="CBSE10">CBSE10</option>
                  </select>
                  <input value={searchChapter} onChange={e => setSearchChapter(e.target.value)} placeholder="Filter chapter (optional)" className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm" />
                </div>
                <button onClick={handleSearch} disabled={searching || !searchQuery.trim()} className="w-full py-2.5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Retrieve Top Passages
                </button>
                {searchResults.length > 0 ? (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto">
                    {searchResults.map((c, i) => (
                      <div key={i} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/50">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="px-2 py-1 rounded-full bg-indigo-600 text-white">#{i + 1} • score {c.score.toFixed(2)}</span>
                          <span className="px-2 py-1 rounded-full bg-white border">{c.exam} / {c.chapter}</span>
                          <span className="text-slate-500 truncate">{c.materialFilename}#chunk-{c.index}</span>
                        </div>
                        <p className="text-sm leading-relaxed mt-2 whitespace-pre-wrap">{c.text.slice(0, 600)}{c.text.length > 600 ? "…" : ""}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No results yet — upload a material then try a query like “Nernst equation” with exam=JEE chapter=Electrochemistry</p>
                )}
              </div>
            </div>

            {/* Materials List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Layers className="w-4 h-4 text-violet-600" /> Indexed Library</h3>
                <button onClick={fetchMaterials} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 border font-semibold flex items-center gap-1 hover:bg-slate-200">
                  <Clock className="w-3 h-3" /> Refresh
                </button>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /><p className="text-sm text-slate-500 mt-2">Loading materials…</p></div>
                ) : materials.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto"><BookMarked className="w-8 h-8 text-slate-400" /></div>
                    <p className="font-semibold text-slate-700 mt-4">No materials yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Upload your NCERT PDFs / notes. They’ll be chunked and retrieved for every Tutor & Quiz call — you’ll see <code className="px-1 bg-slate-100 rounded">[Source: …]</code> citations on the board when they’re used.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {materials.map(m => (
                      <div key={m.id} className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition bg-slate-50/30">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.type === "pdf" ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"}`}>
                            {m.type === "pdf" ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm leading-tight truncate">{m.title}</div>
                            <div className="text-xs text-slate-500 truncate">{m.filename} • {m.type.toUpperCase()} • {(m.charCount / 1000).toFixed(1)}k chars</div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-white font-bold">{m.exam}</span>
                              {m.subject && <span className="text-xs px-2 py-1 rounded-full bg-white border font-semibold">{m.subject}</span>}
                              {m.chapter && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold">{m.chapter}</span>}
                              <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">{m.chunkCount} chunks</span>
                            </div>
                            <p className="text-xs leading-relaxed mt-2 line-clamp-3 text-slate-600 bg-white rounded-xl p-2 border">{m.preview}…</p>
                            <div className="text-xs text-slate-400 mt-2">{new Date(m.createdAt).toLocaleString()}</div>
                          </div>
                          <button onClick={() => handleDelete(m.id)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 shrink-0" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 text-white p-5">
              <h4 className="font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-amber-400" /> Pro Tips</h4>
              <ul className="text-sm text-white/80 mt-3 space-y-2 list-disc list-inside">
                <li>Name <b>Chapter exactly</b> as in syllabus (“Electrostatics”, “Kinematics”) for perfect matching.</li>
                <li>For JEE/NEET, upload <b>one PDF per chapter</b> — retrieval will prefer that chapter’s chunks.</li>
                <li>Include <b>formulas with KaTeX</b> in Markdown — they’ll be quoted verbatim in Tutor answers.</li>
                <li>All storage is <b>local</b> (<code className="px-1 py-0.5 bg-white/20 rounded">data/materials.json</code> + <code className="px-1 py-0.5 bg-white/20 rounded">localStorage</code> fallback) — personal, no cloud.</li>
              </ul>
              <div className="mt-4 flex gap-2">
                <a href="/classroom" className="px-4 py-2 rounded-full bg-white text-slate-900 font-bold text-sm">Test in Classroom →</a>
                <a href="/practice" className="px-4 py-2 rounded-full bg-white/10 border border-white/20 font-semibold text-sm">Test in Quiz →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
