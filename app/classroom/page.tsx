"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import VirtualBoard from "@/components/VirtualBoard";
import { getApiKeys, getSelectedExam } from "@/lib/storage";
import { Mic, MicOff, Send, Image as ImageIcon, Volume2, VolumeX, Trash2, Languages, Sun, Moon, BookOpen, Sparkles, MessageCircle, Lightbulb, RotateCcw, Upload, X, Loader2, Settings2, Play, Zap } from "lucide-react";

function LiveBanner() {
  const [hasKey, setHasKey] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    try { const k = getApiKeys(); setHasKey(!!(k.gemini && k.gemini.length > 10)); } catch {}
    setChecked(true);
  }, []);
  if (!checked) return null;
  return (
    <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-4 lg:px-6 pt-4">
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs sm:text-sm ${hasKey ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
        <span className="flex items-center gap-2 font-semibold">
          {hasKey ? <><Zap className="w-4 h-4 text-emerald-600" /> LIVE AI — Gemini connected. Board, voice & questions are generated live for your topic (not pre-recorded).</> : <><Sparkles className="w-4 h-4 text-amber-600" /> DEMO MOCK — No API key. You’re seeing mock board (same 5 templates). Add GEMINI_API_KEY to go fully live.</>}
        </span>
        {!hasKey && <span className="text-amber-800">Add key in <code className="px-1 py-0.5 bg-white border rounded">.env</code> or <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold">⚙️ Settings</span></span>}
      </div>
    </div>
  );
}

type Language = "English" | "Hindi" | "Hinglish";

function ClassroomInner() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || searchParams.get("chapter") || "";
  const mistakeQuestion = searchParams.get("mistake");
  const mistakeAnswer = searchParams.get("wrong");
  const concept = searchParams.get("concept");

  const [exam] = useState(() => (typeof window !== "undefined" ? getSelectedExam() : "JEE"));
  const [language, setLanguage] = useState<Language>("English");
  const [boardTheme, setBoardTheme] = useState<"dark" | "light">("dark");
  const [boardData, setBoardData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [voiceLang, setVoiceLang] = useState<"en-IN" | "hi-IN">("en-IN");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState<{ role: "user" | "assistant"; content: string; time: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [topic, setTopic] = useState(initialTopic || "Projectile Motion - Kinematics");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Load available voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length && !selectedVoice) {
        const pref = v.find((x) => x.lang === voiceLang) || v.find((x) => x.lang.startsWith(voiceLang.split("-")[0])) || v[0];
        if (pref) setSelectedVoice(pref.name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [voiceLang, selectedVoice]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const speak = (text: string) => {
    if (!autoSpeak || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/\$\$.*?\$\$/g, "").replace(/\$.*?\$/g, "").replace(/\*\*/g, "").slice(0, 900));
    utter.rate = speechRate;
    utter.lang = voiceLang;
    const v = voices.find((x) => x.name === selectedVoice);
    if (v) utter.voice = v;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeak = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleListen = () => {
    // Barge-in: cancel speech immediately
    if (isSpeaking) stopSpeak();

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser. Please type instead.");
      return;
    }
    const rec = new SR();
    rec.lang = voiceLang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      // auto send after voice
      setTimeout(() => handleSend(text), 300);
    };
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {}
  };

  const callTutor = async (userMessage: string, includeImage = false) => {
    setLoading(true);
    const keys = getApiKeys();
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (keys.gemini) headers["x-gemini-key"] = keys.gemini;
      if (keys.openai) headers["x-openai-key"] = keys.openai;

      // If mistake context, prepend to message
      let fullMessage = userMessage;
      if (mistakeQuestion) {
        fullMessage = `I got this question wrong. My answer was "${mistakeAnswer || "unknown"}". The underlying concept is "${concept || topic}". Please teach me this mistake step-by-step. Question: ${mistakeQuestion}\n\nMy doubt: ${userMessage}`;
      }

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [...transcript.map((t) => ({ role: t.role, content: t.content })), { role: "user", content: fullMessage }],
          language,
          exam,
          topic: topic || initialTopic || "General",
          chapter: topic,
          userMessage: fullMessage,
          imageBase64: includeImage ? imageBase64 : null,
          mode: "teach",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBoardData(data);
      setCurrentStep(1);
      // delay step reveal handled by board, but also speak
      const spoken = data.spoken_script || data.board_blocks?.[0]?.content || "";
      setTranscript((prev) => [...prev, { role: "assistant", content: data.board_title + (spoken ? ": " + spoken.slice(0, 200) : ""), time: new Date().toLocaleTimeString() }]);
      if (autoSpeak) setTimeout(() => speak(spoken), 400);
    } catch (e: any) {
      setTranscript((prev) => [...prev, { role: "assistant", content: "⚠️ Error: " + (e.message || "Failed to get lesson"), time: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (override?: string) => {
    const text = (override ?? input).trim();
    if (!text && !imageBase64) return;
    if (isSpeaking) stopSpeak();
    setTranscript((prev) => [...prev, { role: "user", content: text || "(image)", time: new Date().toLocaleTimeString() }]);
    setInput("");
    const withImage = !!imageBase64;
    callTutor(text || "Explain the image", withImage);
    // clear image after sending if desired keep
    // setImageBase64(null);
  };

  const handleStartLesson = () => {
    if (!topic.trim()) return;
    if (isSpeaking) stopSpeak();
    setTranscript((prev) => [...prev, { role: "user", content: `Start lesson: ${topic}`, time: new Date().toLocaleTimeString() }]);
    callTutor(`Teach me ${topic} from scratch, step by step with examples and checkpoint.`);
  };

  const handleExplainDifferently = () => {
    if (isSpeaking) stopSpeak();
    setTranscript((prev) => [...prev, { role: "user", content: "Explain differently / simpler please", time: new Date().toLocaleTimeString() }]);
    callTutor("Explain differently / simpler with a simpler analogy and more visual example. Use Hinglish if language is Hinglish.");
  };

  useEffect(() => {
    // Auto-start if topic from URL
    if (initialTopic && transcript.length === 0) {
      setTimeout(() => {
        setTranscript([{ role: "user", content: `Start lesson: ${initialTopic}`, time: new Date().toLocaleTimeString() }]);
        callTutor(`Teach me ${initialTopic} from scratch, step by step.`);
      }, 600);
    }
    // If mistake mode
    if (mistakeQuestion && transcript.length === 0) {
      setTopic(concept || "Mistake Correction");
      setTimeout(() => {
        const msg = `Teach my mistake: Question: ${mistakeQuestion} — my answer ${mistakeAnswer} was wrong. Concept: ${concept}. Walk me through step-by-step.`;
        setTranscript([{ role: "user", content: msg, time: new Date().toLocaleTimeString() }]);
        callTutor(msg);
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      {/* Live vs Demo hint — same as Dashboard fix */}
      <LiveBanner />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 flex flex-col gap-4">
        {/* Top controls bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex flex-wrap items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic e.g., Electrostatics - Gauss Law" className="px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm w-[260px] sm:w-[380px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" />
            <button onClick={handleStartLesson} disabled={loading || !topic.trim()} className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center gap-2 hover:bg-black disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Start Lesson
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200">
              {(["English", "Hinglish", "Hindi"] as Language[]).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${language === lang ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}>
                  {lang}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 border border-slate-200">
              <button onClick={() => setVoiceLang("en-IN")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${voiceLang === "en-IN" ? "bg-white shadow border" : "text-slate-600"}`}>en-IN</button>
              <button onClick={() => setVoiceLang("hi-IN")} className={`px-3 py-1.5 rounded-full text-xs font-bold ${voiceLang === "hi-IN" ? "bg-white shadow border" : "text-slate-600"}`}>hi-IN</button>
            </div>
            <div className="flex items-center gap-2 ml-1">
              <label className="text-xs font-semibold text-slate-600">Speed</label>
              <input type="range" min={0.7} max={1.3} step={0.1} value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} className="w-20" />
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-full">{speechRate.toFixed(1)}x</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="hidden sm:block px-3 py-2 rounded-full border border-slate-200 bg-white text-xs max-w-[160px]">
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
            <button onClick={() => setAutoSpeak(!autoSpeak)} className={`w-9 h-9 rounded-full flex items-center justify-center border ${autoSpeak ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"}`} title="Auto TTS">
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={stopSpeak} className="px-3 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold flex items-center gap-1 hover:bg-slate-50">
              <VolumeX className="w-3.5 h-3.5" /> Stop
            </button>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-[1.7fr_0.9fr] gap-4 sm:gap-6 min-h-[620px]">
          {/* Left / Main Panel - Virtual Board */}
          <div className="flex flex-col gap-4 min-w-0">
            <VirtualBoard data={boardData} theme={boardTheme} onToggleTheme={() => setBoardTheme(boardTheme === "dark" ? "light" : "dark")} isSpeaking={isSpeaking} currentStep={currentStep} onStepChange={setCurrentStep} />
            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <button onClick={handleExplainDifferently} className="px-4 py-2 rounded-full bg-amber-400 text-amber-900 text-sm font-bold flex items-center gap-2 hover:bg-amber-500">
                <Lightbulb className="w-4 h-4" /> Explain Differently / Simpler
              </button>
              <button onClick={() => callTutor("Give me a practice question on this topic")} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Ask Practice Question
              </button>
              <button onClick={() => callTutor("Summarize what we learned so far")} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-semibold hover:bg-slate-50">
                Summarize
              </button>
              <span className="text-xs text-slate-500 flex items-center ml-auto">Board syncs with speech • Barge-in with mic anytime</span>
            </div>
          </div>

          {/* Right Panel - Live Conversation & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[520px] max-h-[820px]">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4 text-indigo-600" /> Live Conversation</h3>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-emerald-500 animate-pulse" : isListening ? "bg-red-500 animate-pulse" : "bg-slate-300"}`} />
                <span className="text-xs font-semibold text-slate-600">{isSpeaking ? "Teacher Speaking…" : isListening ? "Listening…" : "Idle"}</span>
                <button onClick={() => setTranscript([])} className="ml-2 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50" title="Clear">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {transcript.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-3">No conversation yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start a lesson or ask any doubt — your teacher will respond on the board + voice.</p>
                </div>
              )}
              {transcript.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${m.role === "user" ? "bg-slate-900 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"}`}>
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div className={`text-[10px] mt-1 ${m.role === "user" ? "text-white/60" : "text-slate-400"}`}>{m.time}</div>
                  </div>
                </div>
              ))}
              {loading && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-slate-600"><Loader2 className="w-4 h-4 animate-spin" /> shadow is preparing your board…</div></div>}
              <div ref={transcriptEndRef} />
            </div>

            {/* Image preview */}
            {imageBase64 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-amber-50 flex items-center gap-3">
                <img src={imageBase64} alt="upload" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-900">Image attached — will be sent to vision</p>
                  <p className="text-xs text-amber-700">Click Send or Mic to explain your doubt</p>
                </div>
                <button onClick={() => setImageBase64(null)} className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="p-3 border-t border-slate-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setImageBase64(reader.result as string);
                  reader.readAsDataURL(file);
                }} />
                <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type your doubt or answer… (Hinglish OK)" className="w-full px-4 py-3 pr-12 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  <button onClick={() => handleSend()} disabled={loading || (!input.trim() && !imageBase64)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListen}
                  className={`flex-1 py-3 rounded-full font-bold flex items-center justify-center gap-2 border-2 transition ${isListening ? "bg-red-500 text-white border-red-600 animate-pulse" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isListening ? "Listening… Tap to Stop (Barge-In Active)" : "🎙️ Mic — Speak Doubt (Barge-In)"}
                </button>
                <button
                  onClick={() => { if (isSpeaking) stopSpeak(); else if (boardData?.spoken_script) speak(boardData.spoken_script); }}
                  className={`px-4 py-3 rounded-full font-bold border ${isSpeaking ? "bg-amber-400 text-amber-900 border-amber-500" : "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"}`}
                >
                  {isSpeaking ? "⏸️ Pause" : "🔊 Replay"}
                </button>
              </div>
              <p className="text-[11px] text-center text-slate-400">Instant barge-in: clicking Mic immediately cancels speech via <code className="px-1 bg-slate-100 rounded">speechSynthesis.cancel()</code> — interrupt anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClassroomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> Loading classroom…</div>}>
      <ClassroomInner />
    </Suspense>
  );
}
