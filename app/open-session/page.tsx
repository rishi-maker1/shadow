"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import VirtualBoard from "@/components/VirtualBoard";
import { getApiKeys, getSelectedExam } from "@/lib/storage";
import { Camera, Upload, Mic, Send, Volume2, VolumeX, Loader2, Image as ImageIcon, X, Sparkles, Languages, Lightbulb } from "lucide-react";

export default function OpenSessionPage() {
  const [language, setLanguage] = useState<"English" | "Hindi" | "Hinglish">("Hinglish");
  const [boardTheme, setBoardTheme] = useState<"dark" | "light">("dark");
  const [boardData, setBoardData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [pasteHint, setPasteHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [transcript, setTranscript] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const exam = typeof window !== "undefined" ? getSelectedExam() : "JEE";

  const speak = (text: string) => {
    if (!autoSpeak || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/\$\$.*?\$\$/g, "").replace(/\$.*?\$/g, "").slice(0, 900));
    utter.lang = language === "Hindi" ? "hi-IN" : "en-IN";
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const handleSolve = async () => {
    if (!input.trim() && !imageBase64) return;
    setLoading(true);
    const keys = getApiKeys();
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (keys.gemini) headers["x-gemini-key"] = keys.gemini;
      const res = await fetch("/api/vision-doubt", {
        method: "POST",
        headers,
        body: JSON.stringify({ imageBase64, questionText: input, language, exam }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBoardData(data);
      setCurrentStep(1);
      setTranscript((prev) => [...prev, { role: "user", content: input || "(image)" }, { role: "assistant", content: `Extracted: ${data.extracted_problem?.slice(0, 180) || "Analyzing..."}` }]);
      if (data.spoken_script) setTimeout(() => speak(data.spoken_script), 400);
    } catch (e: any) {
      setBoardData({
        board_title: "Error",
        board_blocks: [{ type: "concept", content: "Failed: " + e.message }],
        spoken_script: "Sorry, failed to solve. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) onFile(file);
        setPasteHint(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" onPaste={onPaste}>
      <Navbar />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white"><Camera className="w-5 h-5" /></span>
            Open Session — 24×7 Doubt Solver (Photo Upload)
          </h1>
          <p className="text-sm text-slate-600 mt-2">No need to pick a chapter. Upload a photo of any textbook/coaching question, speak or type your doubt — JEET AI extracts it, shows it on the board, and walks you through step-by-step <b>without dumping the final answer immediately</b>.</p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* Board */}
          <div className="space-y-4">
            <VirtualBoard data={boardData} theme={boardTheme} onToggleTheme={() => setBoardTheme(boardTheme === "dark" ? "light" : "dark")} isSpeaking={isSpeaking} currentStep={currentStep} onStepChange={setCurrentStep} />
            {boardData && (
              <div className="flex gap-2">
                <button onClick={() => speak(boardData.spoken_script || "")} className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
                  <Volume2 className="w-4 h-4" /> Replay Explanation
                </button>
                <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }} className="px-4 py-2 rounded-full bg-white border text-sm font-bold">Stop</button>
                <button onClick={() => { setBoardData(null); setCurrentStep(0); setImageBase64(null); setInput(""); }} className="ml-auto px-4 py-2 rounded-full bg-white border text-sm font-semibold">Clear Board</button>
              </div>
            )}
          </div>

          {/* Control panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-600" /> Ask Your Doubt</h3>
              <p className="text-xs text-slate-600 mt-1">Upload → Type/Speak → Get step-by-step walkthrough</p>
              <div className="mt-3 flex items-center gap-1 p-1 rounded-full bg-white border border-slate-200 w-fit">
                {(["English", "Hinglish", "Hindi"] as const).map((l) => (
                  <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${language === l ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>{l}</button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1">
              {/* Drag & drop upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${dragOver ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"}`}
              >
                {imageBase64 ? (
                  <div className="relative">
                    <img src={imageBase64} alt="preview" className="max-h-56 mx-auto rounded-xl border shadow" />
                    <button onClick={() => setImageBase64(null)} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
                    <p className="text-xs text-emerald-700 font-semibold mt-3">✓ Image ready — add your doubt text below and hit Solve</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-900 mt-3">Upload or Paste Question Photo</p>
                    <p className="text-xs text-slate-500 mt-1">Drag & drop, click to browse, or press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+V</kbd> to paste screenshot</p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
                    <div className="mt-4 flex justify-center gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-black">Browse Image</button>
                      <button onClick={() => setPasteHint(!pasteHint)} className="px-4 py-2.5 rounded-full bg-white border text-sm font-semibold">Paste Hint</button>
                    </div>
                    {pasteHint && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3 text-left">💡 Take a screenshot of the question (Windows: <b>Win+Shift+S</b>, Mac: <b>Cmd+Shift+4</b>), then come here and press <b>Ctrl+V</b> — it will auto-attach!</p>}
                  </>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Your doubt (type or speak)</label>
                <div className="mt-2 relative">
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., 'Is question ka 3rd step samjha do' or paste the question text here…" rows={3} className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
                  <button
                    onClick={() => {
                      const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                      if (!SR) return alert("Speech not supported");
                      const rec = new SR();
                      rec.lang = language === "Hindi" ? "hi-IN" : "en-IN";
                      rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
                      rec.start();
                    }}
                    className="absolute right-3 top-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button onClick={handleSolve} disabled={loading || (!input.trim() && !imageBase64)} className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? "Analyzing & Preparing Board…" : "Solve Step-by-Step on Board"}
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <label className="flex items-center gap-1.5 font-medium">
                  <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} className="rounded" /> Auto voice
                </label>
                <span className="ml-auto">Vision: Gemini 1.5 Flash (if key set) else mock</span>
              </div>

              {/* Mini transcript */}
              {transcript.length > 0 && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 max-h-40 overflow-y-auto">
                  {transcript.map((m, i) => (
                    <div key={i} className={`text-xs p-2 rounded-xl ${m.role === "user" ? "bg-slate-900 text-white ml-6" : "bg-white border mr-6"}`}>{m.content}</div>
                  ))}
                </div>
              )}

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-amber-800"><b>Pedagogy:</b> We never dump the final answer. The board reveals <b>Step 1 → Checkpoint → Step 2</b> so you actually learn.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
