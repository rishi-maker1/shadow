"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { SYLLABUS, EXAM_META, Exam } from "@/lib/syllabus";
import { getSelectedExam, setSelectedExam, getProgress, saveProgress, getApiKeys } from "@/lib/storage";
import Link from "next/link";
import { ChevronRight, BookOpen, Trophy, Target, Clock, Flame, ArrowRight, PlayCircle, BarChart3, Brain, CheckCircle2, AlertTriangle, Circle, Search, RotateCcw, Zap } from "lucide-react";

export default function Dashboard() {
  const [exam, setExam] = useState<Exam>("JEE");
  const [search, setSearch] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [liveChecked, setLiveChecked] = useState(false);
  const [userProgress, setUserProgress] = useState<{ completed: string[]; inProgress: string[]; weak: string[] } | null>(null);

  useEffect(() => {
    const saved = getSelectedExam() as Exam;
    if (saved && (saved === "JEE" || saved === "NEET" || saved === "CBSE10" || saved === "CBSE12" || saved === "CLASS11" || saved === "CLASS12")) setExam(saved);
    try {
      const k = getApiKeys();
      setHasKey(!!(k.gemini && k.gemini.length > 10));
    } catch {}
    setLiveChecked(true);
    try {
      const p = getProgress();
      if (p) setUserProgress({ completed: p.completed || [], inProgress: p.inProgress || [], weak: p.weak || [] });
      else setUserProgress({ completed: [], inProgress: [], weak: [] });
    } catch { setUserProgress({ completed: [], inProgress: [], weak: [] }); }
  }, []);

  const handleExamChange = (e: Exam) => {
    setExam(e);
    setSelectedExam(e);
  };

  function statusFor(id: string): "completed" | "in-progress" | "weak" | "not-started" {
    if (!userProgress) return "not-started";
    if (userProgress.completed.includes(id)) return "completed";
    if (userProgress.weak.includes(id)) return "weak";
    if (userProgress.inProgress.includes(id)) return "in-progress";
    return "not-started";
  }

  const subjects = SYLLABUS[exam].map((subj) => ({
    ...subj,
    chapters: subj.chapters.map((ch) => ({
      ...ch,
      subtopics: ch.subtopics.map((st) => ({ ...st, status: statusFor(st.id) as any })),
    })),
  }));
  const allChapters = subjects.flatMap((s) => s.chapters);
  const allSubtopics = allChapters.flatMap((c) => c.subtopics);
  const completed = allSubtopics.filter((s) => s.status === "completed").length;
  const inProgress = allSubtopics.filter((s) => s.status === "in-progress").length;
  const weak = allSubtopics.filter((s) => s.status === "weak").length;
  const total = allSubtopics.length;
  const progressPct = total ? Math.round((completed / total) * 100) : 0;

  const handleReset = () => {
    if (!confirm("Reset all progress to 0%? This clears local progress for this browser.")) return;
    const fresh = { completed: [], inProgress: [], weak: [], exam };
    saveProgress(fresh as any);
    setUserProgress({ completed: [], inProgress: [], weak: [] });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {liveChecked && (
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs sm:text-sm ${hasKey ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-900 text-white border-slate-800"}`}>
            <span className="flex items-center gap-2 font-semibold">
              {hasKey ? <><Zap className="w-4 h-4 text-emerald-500" /> shadow LIVE — Gemini connected. Every lesson is generated live for you.</> : <><Zap className="w-4 h-4 text-amber-400" /> shadow — Live Tutor • Add your Gemini key in .env or ⚙️ Settings to enable full internet.</>}
            </span>
            {!hasKey && <span className="text-white/80">Get key: <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline">aistudio.google.com/app/apikey</a></span>}
          </div>
        </div>
      )}
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(244,114,182,0.15),transparent_50%)]" />
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> shadow • 1-on-1 Live
                <span className="w-px h-4 bg-white/20" />
                <span className="text-white/80">Personal • Unlimited • No Payment</span>
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
                Good Evening, <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">Future Topper</span> 👋
              </h1>
              <p className="mt-2 text-white/70 max-w-2xl">Your personal shadow teacher is ready — pick a chapter and start your live 1-on-1 classroom. No hour limits, no subscriptions.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/classroom" className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold flex items-center gap-2 shadow-xl hover:bg-slate-100 transition">
                  <PlayCircle className="w-5 h-5 text-indigo-600" /> Start Live Classroom
                </Link>
                <Link href="/open-session" className="px-6 py-3 rounded-full bg-white/10 border border-white/20 font-semibold backdrop-blur hover:bg-white/15 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Quick Doubt Solver
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:w-[420px] shrink-0">
              <StatCard icon={Trophy} label="Progress" value={`${progressPct}%`} sub={`${completed}/${total} done`} />
              <StatCard icon={Target} label="Weak Concepts" value={`${weak}`} sub="Needs focus" />
              <StatCard icon={Clock} label="Study Time" value="24h" sub="This week" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Exam Selector */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600" /> Choose Your Exam</h2>
            <span className="text-xs text-slate-500">Switch anytime — progress stays saved locally</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {(Object.keys(EXAM_META) as Exam[]).map((key) => {
              const meta = EXAM_META[key];
              const active = exam === key;
              return (
                <button
                  key={key}
                  onClick={() => handleExamChange(key)}
                  className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${active ? "border-slate-900 bg-white shadow-xl scale-[1.02]" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-[0.08] ${active ? "opacity-10" : "opacity-0 group-hover:opacity-5"}`} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{key}</span>
                      {active && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <h3 className="font-bold text-slate-900 mt-3 leading-tight">{meta.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{meta.desc}</p>
                    <p className="text-xs font-semibold text-indigo-600 mt-2">{meta.students} aspirants</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Tracker — PURE LIVE, no demo seed */}
        <div className="mt-8 grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600" /> Syllabus Progress — {EXAM_META[exam].label}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-slate-900 text-white">shadow live</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{progressPct}% Completed</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>{completed === 0 && inProgress === 0 && weak === 0 ? "Fresh start — 0% — your live progress will grow as you learn. No pre-filled demo." : "Live tracking from your lessons & tests (localStorage). 100% your data."}</span>
              {(completed > 0 || inProgress > 0 || weak > 0) && <button onClick={handleReset} className="ml-auto px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold flex items-center gap-1.5 hover:bg-black text-xs"><RotateCcw className="w-3.5 h-3.5" /> Reset 0%</button>}
            </div>
            <div className="mt-4 w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: `${(completed / total) * 100}%` }} />
              <div className="h-full bg-amber-500" style={{ width: `${(inProgress / total) * 100}%` }} />
              <div className="h-full bg-red-500" style={{ width: `${(weak / total) * 100}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Completed {completed}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> In-Progress {inProgress}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Weak {weak}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300" /> Not Started {total - completed - inProgress - weak}</span>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {subjects.map((s) => {
                const subs = s.chapters.flatMap((c) => c.subtopics);
                const comp = subs.filter((x) => x.status === "completed").length;
                const pct = Math.round((comp / subs.length) * 100);
                return (
                  <div key={s.subject} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{s.icon}</span>
                      <span className="font-bold text-sm text-slate-900">{s.subject}</span>
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white border">{pct}%</span>
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{comp}/{subs.length} subtopics</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <h3 className="font-bold flex items-center gap-2 relative"><Flame className="w-5 h-5 text-amber-300" /> Weak Concepts Spotlight</h3>
            <p className="text-sm text-white/80 mt-2 relative">Focus on these to boost your score fastest — live, not pre-recorded.</p>
            <div className="mt-4 space-y-2.5 relative">
              {allSubtopics.filter((s) => s.status === "weak").slice(0, 4).map((w) => (
                <div key={w.id} className="p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="text-sm font-medium leading-tight">{w.name}</span>
                  <Link href={`/classroom?topic=${encodeURIComponent(w.name)}`} className="ml-auto text-xs px-2.5 py-1 rounded-full bg-white text-indigo-700 font-bold hover:bg-amber-50">Fix →</Link>
                </div>
              ))}
              {weak === 0 && <p className="text-sm text-white/70">No weak concepts yet — start learning live and they will appear here.</p>}
            </div>
            <Link href="/practice" className="mt-5 inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full bg-white text-indigo-700 hover:bg-amber-50 relative">
              Practice Weak Topics <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Syllabus Course Tree */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600" /> Syllabus Course Tree</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chapter or subtopic..." className="pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {subjects.map((subj) => (
              <div key={subj.subject} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 sm:px-6 py-4 flex items-center gap-3 border-b border-slate-100" style={{ background: `linear-gradient(90deg, ${subj.color}12, transparent)` }}>
                  <span className="text-2xl">{subj.icon}</span>
                  <h3 className="font-extrabold text-slate-900">{subj.subject}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold">{subj.chapters.length} Chapters</span>
                  <span className="hidden sm:inline text-xs text-slate-500 ml-auto">{subj.chapters.flatMap((c) => c.subtopics).length} subtopics • {subj.chapters.flatMap((c) => c.subtopics).filter((s) => s.status === "completed").length} completed</span>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
                  {subj.chapters
                    .filter((ch) => !search || ch.name.toLowerCase().includes(search.toLowerCase()) || ch.subtopics.some((s) => s.name.toLowerCase().includes(search.toLowerCase())))
                    .map((ch) => {
                      const comp = ch.subtopics.filter((s) => s.status === "completed").length;
                      const hasWeak = ch.subtopics.some((s) => s.status === "weak");
                      return (
                        <div key={ch.id} className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition group bg-slate-50/30">
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">{ch.name}</h4>
                              {hasWeak && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">WEAK</span>}
                            </div>
                            <div className="mt-3 space-y-1.5">
                              {ch.subtopics.map((st) => (
                                <div key={st.id} className="flex items-center gap-2 text-xs">
                                  {st.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : st.status === "weak" ? <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" /> : st.status === "in-progress" ? <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                                  <span className={`${st.status === "completed" ? "text-slate-700" : st.status === "weak" ? "text-red-700 font-medium" : "text-slate-600"} leading-tight`}>{st.name}</span>
                                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${st.difficulty === "Hard" ? "bg-red-50 text-red-600" : st.difficulty === "Medium" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{st.difficulty}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(comp / ch.subtopics.length) * 100}%` }} />
                            </div>
                          </div>
                          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex gap-2">
                            <Link href={`/classroom?chapter=${encodeURIComponent(ch.name)}&subject=${encodeURIComponent(subj.subject)}&exam=${exam}`} className="flex-1 py-2 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black">
                              <PlayCircle className="w-3.5 h-3.5" /> Learn Live
                            </Link>
                            <Link href={`/practice?chapter=${encodeURIComponent(ch.name)}&exam=${exam}`} className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold hover:bg-slate-50 flex items-center gap-1">
                              Test <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-900">💡 shadow — No limits, no paywall, no demo</h4>
            <p className="text-sm text-amber-800/80">Exact duplicate of JEET AI flow — 1-on-1 live teaching, voice, vision, unlimited practice. All progress is yours, stored locally.</p>
          </div>
          <Link href="/classroom" className="px-6 py-3 rounded-full bg-amber-500 text-white font-bold shadow hover:bg-amber-600 whitespace-nowrap">Enter Classroom →</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4">
      <Icon className="w-5 h-5 text-white/70" />
      <div className="text-2xl font-extrabold mt-2 leading-none">{value}</div>
      <div className="text-xs font-semibold text-white/80">{label}</div>
      <div className="text-xs text-white/60">{sub}</div>
    </div>
  );
}
