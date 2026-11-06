"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getApiKeys, saveTest } from "@/lib/storage";
import { SYLLABUS } from "@/lib/syllabus";
import katex from "katex";
import { Clock, CheckCircle2, XCircle, AlertTriangle, Trophy, Target, Brain, ArrowRight, Loader2, Timer, Sparkles, BookOpen, RotateCcw } from "lucide-react";

function renderKatex(text: string) {
  if (!text) return "";
  let html = text;
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => {
    try { return katex.renderToString(m.trim(), { displayMode: true, throwOnError: false }); } catch { return m; }
  });
  html = html.replace(/\$([^\$]+?)\$/g, (_, m) => {
    try { return katex.renderToString(m.trim(), { displayMode: false, throwOnError: false }); } catch { return `$${m}$`; }
  });
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
  return html;
}

function PracticeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialChapter = searchParams.get("chapter") || "";
  const initialExam = searchParams.get("exam") || "JEE";

  const [chapter, setChapter] = useState(initialChapter || "Kinematics");
  const [exam, setExam] = useState(initialExam);
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Generate quiz
  const generate = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    try {
      const keys = getApiKeys();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (keys.gemini) headers["x-gemini-key"] = keys.gemini;
      const res = await fetch("/api/quiz", { method: "POST", headers, body: JSON.stringify({ chapter, exam, count }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
      // timer: 1.5 min per question
      setTimeLeft(count * 90);
      setTimerActive(true);
    } catch (e: any) {
      alert("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialChapter) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!timerActive || submitted) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      setTimerActive(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, submitted]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimerActive(false);
    // compute and save
    let correct = 0;
    let obtained = 0;
    const weak: string[] = [];
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (q.type === "mcq") {
        if (ans === q.correctIndex) { correct += 1; obtained += 4; } else if (ans !== undefined) { obtained -= 1; weak.push(q.subtopic); }
        else weak.push(q.subtopic);
      } else {
        // numerical: allow tolerance 0.05 or 2%
        const userVal = parseFloat(ans);
        const correctVal = parseFloat(q.correctValue);
        if (!isNaN(userVal) && !isNaN(correctVal) && Math.abs(userVal - correctVal) <= Math.max(0.05, Math.abs(correctVal) * 0.02)) { correct += 1; obtained += 4; }
        else if (ans !== undefined && ans !== "") { obtained -= 1; weak.push(q.subtopic); }
      }
    });
    saveTest({
      id: Date.now().toString(),
      chapterId: chapter,
      score: correct,
      total: questions.length,
      maxScore: questions.length * 4,
      obtained,
      accuracy: questions.length ? Math.round((correct / questions.length) * 100) : 0,
      answers,
      timestamp: Date.now(),
      weakSubtopics: [...new Set(weak)],
    });
  };

  const scoreCalc = () => {
    let correct = 0, obtained = 0, attempted = 0;
    questions.forEach((q) => {
      const ans = answers[q.id];
      if (ans === undefined || ans === "") return;
      attempted += 1;
      if (q.type === "mcq") {
        if (ans === q.correctIndex) { correct += 1; obtained += 4; } else obtained -= 1;
      } else {
        const userVal = parseFloat(ans);
        const correctVal = parseFloat(q.correctValue);
        if (!isNaN(userVal) && Math.abs(userVal - correctVal) <= Math.max(0.05, Math.abs(correctVal) * 0.02)) { correct += 1; obtained += 4; } else obtained -= 1;
      }
    });
    return { correct, obtained, attempted };
  };

  const { correct, obtained, attempted } = scoreCalc();
  const maxScore = questions.length * 4;
  const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  const chaptersList = SYLLABUS[exam as keyof typeof SYLLABUS]?.flatMap((s) => s.chapters.map((c) => c.name)) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white"><Target className="w-5 h-5" /></span>
              Practice Sets & Mock Tests
            </h1>
            <p className="text-sm text-slate-600 mt-1">JEE/NEET pattern • <b>+4</b> correct, <b>-1</b> wrong • Timer • Detailed report + “Teach This Mistake”</p>
          </div>
          {timerActive && !submitted && (
            <div className={`px-5 py-3 rounded-2xl border-2 font-mono font-bold flex items-center gap-3 ${timeLeft < 60 ? "bg-red-50 border-red-300 text-red-700 animate-pulse" : "bg-white border-slate-200 text-slate-800"}`}>
              <Timer className="w-5 h-5" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              <span className="text-xs font-sans font-semibold opacity-60">left</span>
            </div>
          )}
        </div>

        {/* Config bar */}
        {!submitted && questions.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <label className="text-sm">
                <span className="font-semibold text-slate-700">Exam</span>
                <select value={exam} onChange={(e) => setExam(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="CBSE10">CBSE 10</option>
                  <option value="CBSE12">CBSE 12</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="font-semibold text-slate-700">Chapter</span>
                <div className="mt-1 flex gap-2">
                  <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    {chaptersList.map((c) => <option key={c} value={c}>{c}</option>)}
                    {!chaptersList.includes(chapter) && <option value={chapter}>{chapter}</option>}
                  </select>
                  <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Or type custom topic" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hidden sm:block" />
                </div>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">Questions:</span>
              {[5, 10, 15].map((n) => (
                <button key={n} onClick={() => setCount(n)} className={`px-4 py-2 rounded-full text-sm font-bold border ${count === n ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200"}`}>{n}</button>
              ))}
              <button onClick={generate} disabled={loading || !chapter.trim()} className="ml-auto px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center gap-2 shadow hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate Test
              </button>
            </div>
            <p className="text-xs text-slate-500">Tip: You can also type any custom topic like “Organic Conversion - CBSE” — AI will generate relevant questions.</p>
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-4">
            {!submitted && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-900">⏱️ Timer running • +4 / -1 marking • Attempt all</span>
                <button onClick={generate} className="text-xs px-3 py-1.5 rounded-full bg-white border font-semibold flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Regenerate</button>
              </div>
            )}

            {questions.map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = q.type === "mcq" ? userAns === q.correctIndex : (() => { const u = parseFloat(userAns); const c = parseFloat(q.correctValue); return !isNaN(u) && Math.abs(u - c) <= Math.max(0.05, Math.abs(c) * 0.02); })();
              const showResult = submitted;
              return (
                <div key={q.id} className={`bg-white rounded-2xl border-2 overflow-hidden ${showResult ? (isCorrect ? "border-emerald-300" : userAns !== undefined && userAns !== "" ? "border-red-200" : "border-amber-200") : "border-slate-200"}`}>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">Q{idx + 1}</span>
                      <div className="flex gap-1.5">
                        <span className={`text-xs px-2 py-1 rounded-full border font-bold ${q.difficulty === "Hard" ? "bg-red-50 text-red-700 border-red-200" : q.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>{q.difficulty}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">{q.subtopic}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border font-bold ${q.type === "numerical" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-slate-50 border-slate-200"}`}>{q.type === "numerical" ? "Numerical" : "MCQ"}</span>
                      </div>
                    </div>
                    <div className="mt-3 prose prose-slate max-w-none text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderKatex(q.question) }} />

                    {q.type === "mcq" ? (
                      <div className="mt-4 grid gap-2">
                        {q.options.map((opt: string, oIdx: number) => {
                          const selected = userAns === oIdx;
                          const correct = q.correctIndex === oIdx;
                          let cls = "border-slate-200 bg-white hover:bg-slate-50";
                          if (showResult) {
                            if (correct) cls = "border-emerald-500 bg-emerald-50";
                            else if (selected) cls = "border-red-500 bg-red-50";
                            else cls = "border-slate-200 bg-slate-50 opacity-60";
                          } else if (selected) cls = "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200";
                          return (
                            <button key={oIdx} onClick={() => !submitted && setAnswers({ ...answers, [q.id]: oIdx })} disabled={submitted} className={`text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 text-sm font-medium transition ${cls}`}>
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${selected ? "bg-slate-900 text-white" : "bg-slate-100"}`}>{String.fromCharCode(65 + oIdx)}</span>
                              <span dangerouslySetInnerHTML={{ __html: renderKatex(opt) }} />
                              {showResult && correct && <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto" />}
                              {showResult && selected && !correct && <XCircle className="w-5 h-5 text-red-600 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <input type="number" step="any" value={userAns ?? ""} onChange={(e) => !submitted && setAnswers({ ...answers, [q.id]: e.target.value })} disabled={submitted} placeholder="Enter numerical value (e.g., 42.5)" className="w-full sm:w-80 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono" />
                        {showResult && <div className="mt-2 text-sm">Correct: <b className="font-mono bg-emerald-100 px-2 py-1 rounded">{q.correctValue}</b> {isCorrect ? "✅" : "❌"}</div>}
                      </div>
                    )}

                    {showResult && (
                      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2"><Brain className="w-4 h-4 text-indigo-600" /> Solution</div>
                        <div className="mt-2 prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: renderKatex(q.solution || q.explanation) }} />
                        {q.explanation && q.solution !== q.explanation && <div className="mt-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-3" dangerouslySetInnerHTML={{ __html: renderKatex(q.explanation) }} />}
                        {/* Ask AI Tutor button */}
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              mistake: q.question,
                              wrong: String(userAns ?? "Not attempted"),
                              concept: q.subtopic,
                              topic: q.subtopic,
                            });
                            router.push(`/classroom?${params.toString()}`);
                          }}
                          className="mt-3 w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-indigo-700"
                        >
                          <BookOpen className="w-4 h-4" /> Ask AI Tutor to Teach This Mistake
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!submitted ? (
              <div className="sticky bottom-4 bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-bold">{attempted}/{questions.length} attempted</span> • <span className="text-slate-600">Correct: <b className="text-emerald-600">{correct}</b> • Score: <b>{obtained}/{maxScore}</b> (+4/-1)</span>
                </div>
                <button onClick={handleSubmit} className="w-full sm:w-auto px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-black flex items-center justify-center gap-2">
                  Submit Test & View Report <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Diagnostic Report */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                  <h2 className="text-xl font-extrabold flex items-center gap-2 relative"><Trophy className="w-6 h-6 text-amber-400" /> Diagnostic Report</h2>
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                      <div className="text-3xl font-extrabold">{correct}/{questions.length}</div>
                      <div className="text-xs font-semibold text-white/70">Correct • {accuracy}% Accuracy</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                      <div className="text-3xl font-extrabold">{obtained} <span className="text-lg opacity-60">/ {maxScore}</span></div>
                      <div className="text-xs font-semibold text-white/70">Score (+4/-1)</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                      <div className="text-3xl font-extrabold">{attempted}</div>
                      <div className="text-xs font-semibold text-white/70">Attempted</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                      <div className="text-3xl font-extrabold">{questions.length - correct}</div>
                      <div className="text-xs font-semibold text-white/70">To Improve</div>
                    </div>
                  </div>
                  <div className="mt-6 grid sm:grid-cols-2 gap-4 relative">
                    <div className="bg-white rounded-2xl p-4 text-slate-900">
                      <h4 className="font-bold text-sm flex items-center gap-2"><Target className="w-4 h-4 text-red-500" /> Weak Subtopics</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[...new Set(questions.filter((q) => {
                          const ans = answers[q.id];
                          if (q.type === "mcq") return ans !== q.correctIndex;
                          const u = parseFloat(ans); const c = parseFloat(q.correctValue); return isNaN(u) || Math.abs(u - c) > Math.max(0.05, Math.abs(c) * 0.02);
                        }).map((q) => q.subtopic))].map((s) => (
                          <span key={s} className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">{s}</span>
                        ))}
                        {correct === questions.length && <span className="text-sm text-emerald-700 font-semibold">Perfect! No weak topics 🎉</span>}
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4">
                      <h4 className="font-bold text-sm">Next Steps</h4>
                      <ul className="mt-2 text-sm text-white/80 space-y-1 list-disc list-inside">
                        <li>Click “Ask AI Tutor” on any wrong question for a live board lesson</li>
                        <li>Weak topics are auto-saved locally for focused practice</li>
                        <li>Regenerate a new set or fix weak concepts in Classroom</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3 relative">
                    <button onClick={() => { setQuestions([]); setSubmitted(false); setAnswers({}); setTimerActive(false); }} className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" /> New Test
                    </button>
                    <button onClick={() => router.push("/classroom")} className="px-6 py-3 rounded-full bg-amber-400 text-amber-900 font-bold hover:bg-amber-500">Go to Classroom →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <PracticeInner />
    </Suspense>
  );
}
