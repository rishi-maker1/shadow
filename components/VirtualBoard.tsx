"use client";
import { useEffect, useState, useRef } from "react";
import katex from "katex";
import { Lightbulb, PenTool, Eye, Play, Pause, SkipForward, Sparkles, Beaker, Atom } from "lucide-react";

interface BoardBlock {
  type: string;
  content: string;
  highlight?: boolean;
}
interface BoardData {
  board_title: string;
  board_blocks: BoardBlock[];
  svg_or_diagram?: string | null;
  simulation_widget?: { type: string; params: any } | null;
  spoken_script?: string;
  checkpoint_question?: any;
}

function renderWithKatex(text: string): string {
  if (!text) return "";
  // Replace display $$...$$ first
  let html = text;
  // Display math $$...$$
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `<span class="font-mono text-sm bg-yellow-100 px-1 rounded">${math}</span>`;
    }
  });
  // Inline math $...$
  html = html.replace(/\$([^\$]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });
  // Simple markdown bold/italic
  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">$1</code>')
    .replace(/\n/g, "<br/>");
  return html;
}

export default function VirtualBoard({
  data,
  theme = "dark",
  onToggleTheme,
  isSpeaking,
  currentStep,
  onStepChange,
  autoPlay = true,
}: {
  data: BoardData | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  isSpeaking?: boolean;
  currentStep: number;
  onStepChange: (n: number) => void;
  autoPlay?: boolean;
}) {
  const [renderedSteps, setRenderedSteps] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data) return;
    if (!autoPlay) {
      setRenderedSteps(data.board_blocks.length);
      return;
    }
    setRenderedSteps(0);
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setRenderedSteps(idx);
      if (idx >= (data.board_blocks?.length || 0)) clearInterval(interval);
    }, 900);
    return () => clearInterval(interval);
  }, [data, autoPlay]);

  useEffect(() => {
    // Sync with currentStep if controlled
    setRenderedSteps(currentStep);
  }, [currentStep]);

  if (!data) {
    return (
      <div className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-12 text-center ${theme === "dark" ? "chalkboard border-slate-700 text-slate-200" : "whiteboard border-slate-200 text-slate-600"}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-4 shadow-xl">
          <PenTool className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg">Virtual Teaching Board</h3>
        <p className="text-sm opacity-70 mt-2 max-w-sm">Start a lesson from the syllabus or ask any doubt — your AI teacher will write, draw, and explain step-by-step here.</p>
        <div className="mt-6 flex gap-2 text-xs opacity-60">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">KaTeX Equations</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Mermaid Diagrams</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Simulations</span>
        </div>
      </div>
    );
  }

  const blocks = data.board_blocks || [];

  return (
    <div className={`rounded-2xl overflow-hidden border shadow-xl flex flex-col ${theme === "dark" ? "chalkboard border-slate-700" : "bg-white border-slate-200 whiteboard"}`}>
      {/* Header bar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === "dark" ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-amber-400 text-slate-900" : "bg-indigo-600 text-white"}`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`font-bold text-sm leading-none ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{data.board_title}</h2>
            <p className={`text-xs ${theme === "dark" ? "text-white/60" : "text-slate-500"}`}>Step {Math.min(renderedSteps, blocks.length)} / {blocks.length} • JEET AI Board</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 mr-2">
            <button onClick={() => onStepChange(Math.max(0, currentStep - 1))} className={`w-7 h-7 rounded-full flex items-center justify-center border ${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"}`}>
              <Play className="w-3 h-3 rotate-180" />
            </button>
            <button onClick={() => onStepChange(Math.min(blocks.length, currentStep + 1))} className={`w-7 h-7 rounded-full flex items-center justify-center border ${theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"}`}>
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
          <button onClick={onToggleTheme} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${theme === "dark" ? "bg-white text-slate-900 border-white" : "bg-slate-900 text-white border-slate-900"}`}>
            <Eye className="w-3.5 h-3.5" />
            {theme === "dark" ? "Whiteboard" : "Chalkboard"}
          </button>
        </div>
      </div>

      {/* Board content */}
      <div ref={boardRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 max-h-[520px] sm:max-h-[600px]">
        {blocks.slice(0, renderedSteps).map((block, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 border-l-4 animate-slideIn ${block.highlight ? (theme === "dark" ? "bg-amber-400/15 border-amber-400 text-amber-50" : "bg-amber-50 border-amber-500 text-slate-900") : theme === "dark" ? "bg-white/[0.06] border-white/20 text-slate-100" : "bg-slate-50 border-indigo-500 text-slate-800"} ${idx === renderedSteps - 1 && isSpeaking ? "ring-2 ring-emerald-400/50" : ""}`}
          >
            {block.type === "equation" ? (
              <div className="overflow-x-auto py-1" dangerouslySetInnerHTML={{ __html: renderWithKatex(block.content) }} />
            ) : (
              <div className="prose prose-sm max-w-none leading-relaxed text-[14px]" dangerouslySetInnerHTML={{ __html: renderWithKatex(block.content) }} />
            )}
            {idx === renderedSteps - 1 && isSpeaking && <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Speaking this step…</div>}
          </div>
        ))}

        {renderedSteps < blocks.length && (
          <button
            onClick={() => onStepChange(renderedSteps + 1)}
            className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-semibold hover:opacity-100 transition ${theme === "dark" ? "border-white/20 text-white/70 hover:bg-white/5" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
          >
            <Sparkles className="w-4 h-4" /> Reveal Next Step ({renderedSteps + 1}/{blocks.length})
          </button>
        )}

        {/* Diagram */}
        {data.svg_or_diagram && renderedSteps >= 1 && (
          <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white text-slate-900 border-white/20" : "bg-slate-900 text-white border-slate-800"}`}>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wide opacity-60 mb-3">
              <Atom className="w-3.5 h-3.5" /> DIAGRAM • Visual Aid
            </div>
            {/* Simple render: if mermaid-like, show as text in canvas-like; otherwise render as svg */}
            {data.svg_or_diagram.trim().startsWith("<svg") || data.svg_or_diagram.trim().startsWith("<?xml") ? (
              <div dangerouslySetInnerHTML={{ __html: data.svg_or_diagram }} />
            ) : (
              <DiagramRenderer code={data.svg_or_diagram} theme={theme} />
            )}
          </div>
        )}

        {/* Simulation */}
        {data.simulation_widget && data.simulation_widget.type !== "none" && renderedSteps >= 2 && (
          <SimulationWidget type={data.simulation_widget.type} params={data.simulation_widget.params} theme={theme} />
        )}

        {/* Checkpoint */}
        {data.checkpoint_question && renderedSteps >= blocks.length && (
          <div className={`rounded-xl p-4 border-2 ${theme === "dark" ? "bg-violet-500/15 border-violet-400/50" : "bg-violet-50 border-violet-300"}`}>
            <div className={`text-xs font-extrabold tracking-widest mb-2 ${theme === "dark" ? "text-violet-300" : "text-violet-600"}`}>✋ CHECKPOINT — ANSWER BEFORE WE CONTINUE</div>
            <div className={`font-semibold text-sm mb-3 ${theme === "dark" ? "text-white" : "text-slate-900"}`} dangerouslySetInnerHTML={{ __html: renderWithKatex(data.checkpoint_question.question) }} />
            <CheckpointOptions question={data.checkpoint_question} theme={theme} />
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className={`px-4 py-3 border-t flex items-center justify-between ${theme === "dark" ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50"}`}>
        <div className="flex gap-1.5">
          {blocks.map((_, i) => (
            <button
              key={i}
              onClick={() => onStepChange(i + 1)}
              className={`h-2 rounded-full transition-all ${i < renderedSteps ? (theme === "dark" ? "bg-amber-400 w-8" : "bg-indigo-600 w-8") : theme === "dark" ? "bg-white/20 w-2" : "bg-slate-300 w-2"}`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${theme === "dark" ? "text-white/60" : "text-slate-500"}`}>{renderedSteps}/{blocks.length} steps revealed</span>
      </div>
    </div>
  );
}

function DiagramRenderer({ code, theme }: { code: string; theme: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: theme === "dark" ? "dark" : "default", securityLevel: "loose" });
        const id = "m-" + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, code);
        if (mounted) setSvg(svg);
      } catch (e) {
        if (mounted) setSvg("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [code, theme]);

  if (svg) return <div className="overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
  return (
    <pre className={`text-xs p-3 rounded-lg overflow-x-auto font-mono ${theme === "dark" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>{code}</pre>
  );
}

function SimulationWidget({ type, params, theme }: { type: string; params: any; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(true);
  const [theta, setTheta] = useState(params?.theta || 45);
  const [velocity, setVelocity] = useState(params?.u || 20);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let t = 0;
    const g = 10;
    const rad = (theta * Math.PI) / 180;
    const ux = velocity * Math.cos(rad);
    const uy = velocity * Math.sin(rad);
    const scale = 6;

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ground
      ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.3)" : "#cbd5e1";
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 30);
      ctx.lineTo(canvas.width - 10, canvas.height - 30);
      ctx.stroke();
      // trajectory path faded
      ctx.strokeStyle = theme === "dark" ? "rgba(251,191,36,0.3)" : "rgba(99,102,241,0.2)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let tt = 0; tt <= 4; tt += 0.05) {
        const x = 30 + ux * tt * scale;
        const y = canvas.height - 30 - (uy * tt - 0.5 * g * tt * tt) * scale;
        if (tt === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        if (y > canvas.height - 30) break;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // current ball
      const x = 30 + ux * t * scale;
      const y = canvas.height - 30 - (uy * t - 0.5 * g * t * t) * scale;
      if (y > canvas.height - 30 || x > canvas.width - 20) {
        t = 0;
      }
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      // velocity vector
      const vx = ux;
      const vy = uy - g * t;
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + vx * 1.2, y - vy * 1.2);
      ctx.stroke();

      t += 0.02;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [theta, velocity, running, theme]);

  return (
    <div className={`rounded-xl overflow-hidden border ${theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
        <span className={`text-xs font-bold flex items-center gap-2 ${theme === "dark" ? "text-white/80" : "text-slate-700"}`}>
          <Beaker className="w-3.5 h-3.5" /> Interactive Simulation: {type}
        </span>
        <button onClick={() => setRunning(!running)} className={`px-3 py-1 rounded-full text-xs font-bold ${running ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}>
          {running ? "● Running" : "Paused"}
        </button>
      </div>
      <canvas ref={canvasRef} width={560} height={220} className="w-full block" style={{ maxWidth: "100%" }} />
      <div className={`px-4 py-3 grid grid-cols-2 gap-4 ${theme === "dark" ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        <label className="text-xs">
          <span className={`${theme === "dark" ? "text-white/60" : "text-slate-600"}`}>Angle {theta}°</span>
          <input type="range" min={15} max={75} value={theta} onChange={(e) => setTheta(Number(e.target.value))} className="w-full mt-1" />
        </label>
        <label className="text-xs">
          <span className={`${theme === "dark" ? "text-white/60" : "text-slate-600"}`}>Velocity {velocity} m/s</span>
          <input type="range" min={10} max={40} value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="w-full mt-1" />
        </label>
      </div>
    </div>
  );
}

function CheckpointOptions({ question, theme }: { question: any; theme: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    setShowResult(true);
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        {question.options?.map((opt: string, idx: number) => {
          const isCorrect = idx === question.correctIndex;
          const isSelected = selected === idx;
          let cls = theme === "dark" ? "bg-white/10 border-white/20 text-white hover:bg-white/15" : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50";
          if (showResult) {
            if (isCorrect) cls = "bg-emerald-500 text-white border-emerald-600";
            else if (isSelected && !isCorrect) cls = "bg-red-500 text-white border-red-600";
            else cls = theme === "dark" ? "bg-white/5 border-white/10 text-white/50" : "bg-slate-100 border-slate-200 text-slate-500";
          }
          return (
            <button key={idx} onClick={() => !showResult && handleSelect(idx)} className={`text-left px-4 py-3 rounded-xl border font-medium text-sm flex items-center gap-3 transition ${cls}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${showResult && isCorrect ? "bg-white/20" : "bg-black/10"}`}>{String.fromCharCode(65 + idx)}</span>
              <span dangerouslySetInnerHTML={{ __html: renderWithKatex(opt) }} />
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className={`p-3 rounded-xl text-sm ${selected === question.correctIndex ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
          {selected === question.correctIndex ? "✅ Correct! " : "❌ Not quite. "}
          <span dangerouslySetInnerHTML={{ __html: renderWithKatex(question.explanation) }} />
          {selected !== question.correctIndex && question.hint && <div className="mt-2 text-xs opacity-80">Hint: <span dangerouslySetInnerHTML={{ __html: renderWithKatex(question.hint) }} /></div>}
        </div>
      )}
    </div>
  );
}
