"use client";
import { useEffect, useState, useRef } from "react";
import katex from "katex";
import { Lightbulb, PenTool, Eye, Play, Pause, SkipForward, Sparkles, Beaker, Atom, SlidersHorizontal, RefreshCw } from "lucide-react";

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
  let html = text;
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `<span class="font-mono text-sm bg-yellow-100 px-1 rounded">${math}</span>`;
    }
  });
  html = html.replace(/\$([^\$]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });
  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">$1</code>')
    .replace(/\n/g, "<br/>");
  return html;
}

const SIM_TYPES = [
  { id: "projectile", label: "Projectile", icon: "🎯", desc: "Angle & velocity" },
  { id: "pendulum", label: "Pendulum / SHM", icon: "⏳", desc: "L, θ, damping" },
  { id: "ray_optics", label: "Ray Optics", icon: "🔭", desc: "Lens & image" },
  { id: "ideal_gas", label: "Ideal Gas", icon: "🧪", desc: "P-V-T · nRT" },
  { id: "equilibrium", label: "Equilibrium", icon: "⚗️", desc: "Kc & Q" },
] as const;

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
  const [manualSim, setManualSim] = useState<string | null>(null);

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
    setRenderedSteps(currentStep);
  }, [currentStep]);

  // reset manual sim when new data arrives
  useEffect(() => {
    setManualSim(null);
  }, [data]);

  if (!data) {
    return (
      <div className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 sm:p-12 text-center ${theme === "dark" ? "chalkboard border-slate-700 text-slate-200" : "whiteboard border-slate-200 text-slate-600"}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-4 shadow-xl">
          <PenTool className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg">Virtual Teaching Board</h3>
        <p className="text-sm opacity-70 mt-2 max-w-sm">Start a lesson from the syllabus or ask any doubt — your AI teacher will write, draw, and explain step-by-step here.</p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs opacity-60">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">KaTeX</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Mermaid</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Canvas SVG</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Interactive Sims</span>
        </div>
        {/* manual sim picker even when no data */}
        <div className={`mt-6 w-full max-w-md rounded-xl border p-4 ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <p className={`text-xs font-bold tracking-wide mb-2 ${theme === "dark" ? "text-white/80" : "text-slate-700"}`}>Try a simulation even without AI:</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {SIM_TYPES.map(s => (
              <button key={s.id} onClick={() => {
                // create fake board data to show sim
                setManualSim(s.id);
              }} className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 hover:scale-105 transition ${theme === "dark" ? "bg-white/10 border-white/10 text-white hover:bg-white/15" : "bg-white border-slate-200 hover:bg-slate-50"}`}>
                <span className="text-lg">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
          {manualSim && (
            <div className="mt-4">
              <SimulationWidget type={manualSim} params={{}} theme={theme} />
              <button onClick={() => setManualSim(null)} className="mt-2 text-xs underline opacity-70">Clear</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const blocks = data.board_blocks || [];
  const activeSimType = manualSim || data.simulation_widget?.type;
  const activeSimParams = data.simulation_widget?.params || {};

  return (
    <div className={`rounded-2xl overflow-hidden border shadow-xl flex flex-col ${theme === "dark" ? "chalkboard border-slate-700" : "bg-white border-slate-200 whiteboard"}`}>
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

      <div ref={boardRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 max-h-[640px] sm:max-h-[700px]">
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

        {data.svg_or_diagram && renderedSteps >= 1 && (
          <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white text-slate-900 border-white/20" : "bg-slate-900 text-white border-slate-800"}`}>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wide opacity-60 mb-3">
              <Atom className="w-3.5 h-3.5" /> DIAGRAM • Visual Aid
            </div>
            {data.svg_or_diagram.trim().startsWith("<svg") || data.svg_or_diagram.trim().startsWith("<?xml") ? (
              <div dangerouslySetInnerHTML={{ __html: data.svg_or_diagram }} />
            ) : (
              <DiagramRenderer code={data.svg_or_diagram} theme={theme} />
            )}
          </div>
        )}

        {/* Simulation picker toolbar */}
        <div className={`rounded-xl p-3 border flex flex-col gap-2 ${theme === "dark" ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <SlidersHorizontal className={`w-4 h-4 ${theme === "dark" ? "text-amber-300" : "text-indigo-600"}`} />
            <span className={theme === "dark" ? "text-white/90" : "text-slate-800"}>Interactive Mini-Sims — drag sliders while the tutor talks!</span>
            <span className={`ml-auto text-[10px] px-2 py-1 rounded-full border ${theme === "dark" ? "bg-white/10 border-white/10 text-white/70" : "bg-white border-slate-200 text-slate-600"}`}>AI can auto-trigger • You can override anytime</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SIM_TYPES.map(s => {
              const active = activeSimType === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setManualSim(active ? null : s.id)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 transition ${active ? "bg-amber-400 text-amber-900 border-amber-500 shadow" : theme === "dark" ? "bg-white/10 text-white border-white/10 hover:bg-white/15" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              );
            })}
            {manualSim && (
              <button onClick={() => setManualSim(null)} className="px-3 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Reset to AI
              </button>
            )}
          </div>
        </div>

        {/* Simulation: show AI's sim or manual override */}
        {(activeSimType && activeSimType !== "none") && (
          <SimulationWidget type={activeSimType} params={activeSimType === manualSim ? {} : activeSimParams} theme={theme} />
        )}

        {data.checkpoint_question && renderedSteps >= blocks.length && (
          <div className={`rounded-xl p-4 border-2 ${theme === "dark" ? "bg-violet-500/15 border-violet-400/50" : "bg-violet-50 border-violet-300"}`}>
            <div className={`text-xs font-extrabold tracking-widest mb-2 ${theme === "dark" ? "text-violet-300" : "text-violet-600"}`}>✋ CHECKPOINT — ANSWER BEFORE WE CONTINUE</div>
            <div className={`font-semibold text-sm mb-3 ${theme === "dark" ? "text-white" : "text-slate-900"}`} dangerouslySetInnerHTML={{ __html: renderWithKatex(data.checkpoint_question.question) }} />
            <CheckpointOptions question={data.checkpoint_question} theme={theme} />
          </div>
        )}
      </div>

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
        <span className={`text-xs font-medium ${theme === "dark" ? "text-white/60" : "text-slate-500"}`}>{renderedSteps}/{blocks.length} steps • Simulations live while speaking</span>
      </div>
    </div>
  );
}

function DiagramRenderer({ code, theme }: { code: string; theme: string }) {
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
    return () => { mounted = false; };
  }, [code, theme]);

  if (svg) return <div className="overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />;
  return <pre className={`text-xs p-3 rounded-lg overflow-x-auto font-mono ${theme === "dark" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}>{code}</pre>;
}

// ============ SIMULATION WIDGET DISPATCHER ============

function SimulationWidget({ type, params, theme }: { type: string; params: any; theme: string }) {
  const t = type.toLowerCase();
  if (t === "projectile" || t === "projectile_motion") return <ProjectileSim params={params} theme={theme} />;
  if (t === "pendulum" || t === "shm" || t === "shm_wave") return <PendulumSHMSim params={params} theme={theme} />;
  if (t === "ray_optics" || t === "lens" || t === "optics") return <RayOpticsSim params={params} theme={theme} />;
  if (t === "ideal_gas" || t === "gas" || t === "pvt") return <IdealGasSim params={params} theme={theme} />;
  if (t === "equilibrium" || t === "chemical" || t === "reaction") return <EquilibriumSim params={params} theme={theme} />;
  if (t === "wave") return <WaveSim params={params} theme={theme} />;
  if (t === "circuit") return <CircuitSim params={params} theme={theme} />;
  // fallback: projectile
  return <ProjectileSim params={params} theme={theme} />;
}

// ============ 1. PROJECTILE ============

function ProjectileSim({ params, theme }: { params: any; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theta, setTheta] = useState(params?.theta ?? params?.angle ?? 45);
  const [velocity, setVelocity] = useState(params?.u ?? params?.velocity ?? 20);
  const [g, setG] = useState(params?.g ?? 10);
  const [height, setHeight] = useState(params?.height ?? 0);
  const [running, setRunning] = useState(true);
  const tRef = useRef(0);

  const rad = (theta * Math.PI) / 180;
  const ux = velocity * Math.cos(rad);
  const uy = velocity * Math.sin(rad);
  // kinematics
  const T = height === 0 ? (2 * uy) / g : (uy + Math.sqrt(uy * uy + 2 * g * height)) / g;
  const R = ux * T;
  const H = height + (uy * uy) / (2 * g);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const scale = 5.5;
    const originX = 30;
    const groundY = canvas.height - 30;

    const animate = () => {
      if (!running) {
        raf = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // sky gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (theme === "dark") {
        bg.addColorStop(0, "#0f172a");
        bg.addColorStop(1, "#1e293b");
      } else {
        bg.addColorStop(0, "#f8fafc");
        bg.addColorStop(1, "#e2e8f0");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ground
      ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.25)" : "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();
      // height launch platform if height>0
      if (height > 0) {
        const platY = groundY - height * scale;
        ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
        ctx.fillRect(originX - 12, platY, 24, groundY - platY);
        ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.3)" : "#64748b";
        ctx.strokeRect(originX - 12, platY, 24, groundY - platY);
      }

      // faded trajectory
      ctx.strokeStyle = theme === "dark" ? "rgba(251,191,36,0.35)" : "rgba(99,102,241,0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let tt = 0; tt <= T + 0.1; tt += 0.03) {
        const x = originX + ux * tt * scale;
        const y = groundY - height * scale - (uy * tt - 0.5 * g * tt * tt) * scale;
        if (tt === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        if (y > groundY) break;
        if (x > canvas.width - 14) break;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // max height marker
      const maxX = originX + (ux * (uy / g)) * scale;
      const maxY = groundY - H * scale;
      ctx.fillStyle = "rgba(16,185,129,0.9)";
      ctx.beginPath();
      ctx.arc(maxX, maxY, 3, 0, Math.PI * 2);
      ctx.fill();

      // current ball
      const tt = tRef.current;
      let x = originX + ux * tt * scale;
      let y = groundY - height * scale - (uy * tt - 0.5 * g * tt * tt) * scale;
      if (y > groundY || x > canvas.width - 10 || tt > T) {
        tRef.current = 0;
        x = originX;
        y = groundY - height * scale;
      }
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(x, groundY + 4, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // ball
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // velocity vector
      const vx = ux;
      const vy = uy - g * tt;
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + vx * 1.3, y - vy * 1.3);
      ctx.stroke();
      // arrow head
      const ang = Math.atan2(-vy, vx);
      const ah = 6;
      ctx.beginPath();
      ctx.moveTo(x + vx * 1.3, y - vy * 1.3);
      ctx.lineTo(x + vx * 1.3 - ah * Math.cos(ang - 0.4), y - vy * 1.3 + ah * Math.sin(ang - 0.4));
      ctx.lineTo(x + vx * 1.3 - ah * Math.cos(ang + 0.4), y - vy * 1.3 + ah * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fillStyle = "#10b981";
      ctx.fill();

      tRef.current += 0.016;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [theta, velocity, g, height, running, theme, ux, uy, T, H]);

  // live recomputes when sliders change, reset t
  useEffect(() => { tRef.current = 0; }, [theta, velocity, g, height]);

  return (
    <div className={`rounded-xl overflow-hidden border shadow ${theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
        <span className={`text-xs font-bold flex items-center gap-2 ${theme === "dark" ? "text-white/90" : "text-slate-700"}`}><Beaker className="w-3.5 h-3.5" /> Projectile Motion — Interact while tutor speaks</span>
        <button onClick={() => setRunning(!running)} className={`px-3 py-1 rounded-full text-xs font-bold ${running ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}>{running ? "● Running" : "Paused"}</button>
      </div>
      <canvas ref={canvasRef} width={560} height={220} className="w-full block" />
      <div className={`px-4 py-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs ${theme === "dark" ? "bg-white/[0.03] text-white/70" : "bg-slate-50"}`}>
        <label><span>Angle {theta}°</span><input type="range" min={5} max={85} value={theta} onChange={e => setTheta(+e.target.value)} className="w-full mt-1 accent-amber-500" /></label>
        <label><span>Velocity {velocity} m/s</span><input type="range" min={5} max={45} value={velocity} onChange={e => setVelocity(+e.target.value)} className="w-full mt-1 accent-indigo-500" /></label>
        <label><span>Gravity {g}</span><input type="range" min={5} max={20} value={g} onChange={e => setG(+e.target.value)} className="w-full mt-1 accent-emerald-500" /></label>
        <label><span>Height {height} m</span><input type="range" min={0} max={30} value={height} onChange={e => setHeight(+e.target.value)} className="w-full mt-1 accent-violet-500" /></label>
      </div>
      <div className={`px-4 py-3 grid grid-cols-3 gap-2 text-xs ${theme === "dark" ? "bg-slate-900/40 border-t border-white/5" : "bg-white border-t"} ${theme === "dark" ? "text-slate-200" : "text-slate-700"}`}>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center"><div className="font-mono font-bold text-amber-500">{T.toFixed(2)} s</div><div className="opacity-60">Time of flight</div><div className="font-mono text-[10px] opacity-50">T = 2u sinθ/g</div></div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center"><div className="font-mono font-bold text-emerald-500">{R.toFixed(1)} m</div><div className="opacity-60">Range</div><div className="font-mono text-[10px] opacity-50">R = u² sin2θ/g</div></div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center"><div className="font-mono font-bold text-violet-400">{H.toFixed(1)} m</div><div className="opacity-60">Max height</div><div className="font-mono text-[10px] opacity-50">H = u² sin²θ/2g</div></div>
      </div>
    </div>
  );
}

// ============ 2. PENDULUM / SHM ============

function PendulumSHMSim({ params, theme }: { params: any; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState(params?.length ?? params?.L ?? 1.2);
  const [angle, setAngle] = useState(params?.angle ?? params?.theta ?? 25);
  const [damping, setDamping] = useState(params?.damping ?? 0.02);
  const [gravity, setGravity] = useState(params?.gravity ?? 9.8);
  const [running, setRunning] = useState(true);
  const phaseRef = useRef(0);

  const omega = Math.sqrt(gravity / length);
  const period = (2 * Math.PI) / omega;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const pivotX = canvas.width / 2;
    const pivotY = 42;
    const pxPerMeter = 72;

    const animate = () => {
      if (!running) { raf = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (theme === "dark") { bg.addColorStop(0, "#0f172a"); bg.addColorStop(1, "#1e293b"); }
      else { bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#f1f5f9"); }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // SHM graph at bottom
      const graphTop = canvas.height - 92;
      const graphH = 76;
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
      ctx.fillRect(14, graphTop, canvas.width - 28, graphH);
      ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
      ctx.strokeRect(14, graphTop, canvas.width - 28, graphH);
      // axis
      ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.moveTo(14, graphTop + graphH / 2);
      ctx.lineTo(canvas.width - 14, graphTop + graphH / 2);
      ctx.stroke();
      // wave
      const ampRad = (angle * Math.PI) / 180;
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const waveW = canvas.width - 28;
      const samples = 160;
      for (let i = 0; i <= samples; i++) {
        const frac = i / samples;
        const t = (phaseRef.current - frac * period) % period;
        // damped
        const thetaT = ampRad * Math.cos(omega * t) * Math.exp(-damping * (phaseRef.current - frac * 2));
        // map to graph height: y = mid - thetaT * scale
        const y = graphTop + graphH / 2 - thetaT * 55;
        const x = 14 + frac * waveW;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // current dot
      const curTheta = ampRad * Math.cos(omega * phaseRef.current) * Math.exp(-damping * phaseRef.current * 0.5);
      const curY = graphTop + graphH / 2 - curTheta * 55;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(canvas.width - 30, curY, 4, 0, Math.PI * 2);
      ctx.fill();

      // pendulum
      const thetaNow = curTheta;
      const rodLenPx = length * pxPerMeter;
      const bobX = pivotX + Math.sin(thetaNow) * rodLenPx;
      const bobY = pivotY + Math.cos(thetaNow) * rodLenPx;

      // rod
      ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.9)" : "#0f172a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();
      // pivot
      ctx.fillStyle = theme === "dark" ? "#e2e8f0" : "#1e293b";
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
      ctx.fill();
      // arc
      ctx.strokeStyle = theme === "dark" ? "rgba(251,191,36,0.35)" : "rgba(245,158,11,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, rodLenPx, -ampRad - Math.PI / 2 + 1.57, ampRad - Math.PI / 2 + 1.57);
      // Actually angle offset tricky; simpler use small arc
      ctx.stroke();
      ctx.setLineDash([]);
      // bob
      const grad = ctx.createRadialGradient(bobX - 3, bobY - 3, 2, bobX, bobY, 14);
      grad.addColorStop(0, "#fbbf24");
      grad.addColorStop(1, "#d97706");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // velocity arrow
      const omegaInst = -ampRad * omega * Math.sin(omega * phaseRef.current);
      const v = omegaInst * length; // m/s tangential
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      const vx = Math.cos(thetaNow) * v * 10;
      const vy = -Math.sin(thetaNow) * v * 10;
      ctx.beginPath();
      ctx.moveTo(bobX, bobY);
      ctx.lineTo(bobX + vx, bobY + vy);
      ctx.stroke();

      // text
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.fillText(`θ = ${(thetaNow * 180 / Math.PI).toFixed(1)}°`, bobX + 16, bobY - 6);
      ctx.fillText(`T = ${period.toFixed(2)} s`, pivotX + 56, pivotY - 12);

      phaseRef.current += 0.016;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [length, angle, damping, gravity, running, theme, omega, period]);

  useEffect(() => { phaseRef.current = 0; }, [length, angle, damping, gravity]);

  return (
    <div className={`rounded-xl overflow-hidden border shadow ${theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
        <span className={`text-xs font-bold flex items-center gap-2 ${theme === "dark" ? "text-white/90" : "text-slate-700"}`}>⏳ Simple Pendulum & SHM — Live</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-1 rounded-full border ${theme === "dark" ? "bg-white/10 border-white/10" : "bg-white border-slate-200"}`}>ω = √(g/L)</span>
          <button onClick={() => setRunning(!running)} className={`px-3 py-1 rounded-full text-xs font-bold ${running ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}>{running ? "● Swinging" : "Paused"}</button>
        </div>
      </div>
      <canvas ref={canvasRef} width={560} height={260} className="w-full block" />
      <div className={`px-4 py-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs ${theme === "dark" ? "bg-white/[0.03] text-white/70" : "bg-slate-50"}`}>
        <label>Length {length.toFixed(2)} m<input type="range" min={0.5} max={2.2} step={0.05} value={length} onChange={e => setLength(+e.target.value)} className="w-full mt-1 accent-violet-600" /></label>
        <label>Amplitude {angle}°<input type="range" min={5} max={45} value={angle} onChange={e => setAngle(+e.target.value)} className="w-full mt-1 accent-amber-500" /></label>
        <label>Damping {damping.toFixed(2)}<input type="range" min={0} max={0.08} step={0.01} value={damping} onChange={e => setDamping(+e.target.value)} className="w-full mt-1 accent-emerald-500" /></label>
        <label>g {gravity.toFixed(1)}<input type="range" min={1.6} max={15} step={0.2} value={gravity} onChange={e => setGravity(+e.target.value)} className="w-full mt-1 accent-indigo-500" /></label>
      </div>
      <div className={`px-4 py-2 flex gap-2 text-xs ${theme === "dark" ? "bg-slate-900/40 border-t border-white/5 text-slate-300" : "bg-white border-t text-slate-600"}`}>
        <span className="font-mono">T = 2π√(L/g) = <b className="text-violet-500">{period.toFixed(2)}s</b></span>
        <span className="opacity-50">• f = {(1 / period).toFixed(2)} Hz • θ(t)=θ₀ cos(ωt) e⁻ᵝᵗ</span>
      </div>
    </div>
  );
}

function WaveSim({ params, theme }: { params: any; theme: string }) {
  // Simple wave alias to pendulum with wave focus
  return <PendulumSHMSim params={{ ...params, length: params?.length ?? 1 }} theme={theme} />;
}

function CircuitSim({ params, theme }: { params: any; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voltage, setVoltage] = useState(params?.voltage ?? 9);
  const [resistance, setResistance] = useState(params?.resistance ?? 10);
  const current = voltage / resistance;
  const power = voltage * current;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = theme === "dark" ? "#0f172a" : "#f8fafc";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // circuit rect
      const left = 60, top = 50, w = 440, h = 120;
      ctx.strokeStyle = theme === "dark" ? "#e2e8f0" : "#0f172a";
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, w, h);
      // battery
      ctx.fillStyle = theme === "dark" ? "#fbbf24" : "#f59e0b";
      ctx.fillRect(left - 2, top + h / 2 - 18, 4, 36);
      ctx.fillStyle = theme === "dark" ? "#e2e8f0" : "#334155";
      ctx.font = "11px monospace";
      ctx.fillText(`${voltage}V`, left - 18, top + h / 2 - 24);
      // resistor zigzag
      ctx.beginPath();
      const ry = top;
      const rx = left + w / 2 - 30;
      ctx.moveTo(rx, ry);
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(rx + 10 + (i % 2 ? -8 : 8), ry - 10 + (i % 2 ? 8 : -8) * 0.5);
      }
      ctx.stroke();
      ctx.fillText(`${resistance}Ω`, rx + 8, ry - 18);
      // current dots
      const perim = 2 * (w + h);
      const speed = Math.min(6, Math.max(0.5, current * 1.2));
      t += speed;
      for (let k = 0; k < 3; k++) {
        const pos = (t + k * (perim / 3)) % perim;
        let x, y;
        if (pos < w) { x = left + pos; y = top; }
        else if (pos < w + h) { x = left + w; y = top + (pos - w); }
        else if (pos < 2 * w + h) { x = left + w - (pos - w - h); y = top + h; }
        else { x = left; y = top + h - (pos - 2 * w - h); }
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [voltage, resistance, current, theme]);

  return (
    <div className={`rounded-xl overflow-hidden border ${theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
        <span className="text-xs font-bold">🔌 Circuit — V = IR</span>
        <span className="text-xs font-mono">I={current.toFixed(2)}A • P={power.toFixed(2)}W</span>
      </div>
      <canvas ref={canvasRef} width={560} height={200} className="w-full block" />
      <div className="px-4 py-3 grid grid-cols-2 gap-4 text-xs bg-slate-50">
        <label>Voltage {voltage} V<input type="range" min={1} max={24} value={voltage} onChange={e => setVoltage(+e.target.value)} className="w-full" /></label>
        <label>Resistance {resistance} Ω<input type="range" min={2} max={50} value={resistance} onChange={e => setResistance(+e.target.value)} className="w-full" /></label>
      </div>
    </div>
  );
}

// ============ 3. RAY OPTICS ============

function RayOpticsSim({ params, theme }: { params: any; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [f, setF] = useState(params?.focalLength ?? params?.f ?? 12);
  const [do_, setDo] = useState(params?.objectDistance ?? params?.do ?? 28);
  const [h, setH] = useState(params?.objectHeight ?? 18);
  const [type, setType] = useState<"convex" | "concave">((params?.lensType as any) ?? "convex");
  const isConvex = type === "convex";
  // lens formula 1/f =1/do +1/di  => di =1/(1/f -1/do)
  const invF = isConvex ? 1 / f : -1 / Math.abs(f);
  const di = 1 / (invF - 1 / do_);
  const m = -di / do_;
  const hi = h * m;
  const isReal = di > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const scale = 7; // px per cm

    ctx.clearRect(0, 0, W, H);
    const bg = theme === "dark" ? "#0f172a" : "#ffffff";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // principal axis
    ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.25)" : "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();
    // focal marks
    const fPx = f * scale;
    const drawMark = (x: number, label: string) => {
      ctx.strokeStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(x, cy - 8);
      ctx.lineTo(x, cy + 8);
      ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.font = "10px monospace";
      ctx.fillText(label, x - 6, cy - 12);
    };
    drawMark(cx - fPx, isConvex ? "F" : "Fv");
    drawMark(cx + fPx, isConvex ? "F'" : "Fv'");
    // 2F
    ctx.strokeStyle = "rgba(245,158,11,0.35)";
    const twoF = 2 * fPx;
    drawMark(cx - twoF, "2F");
    drawMark(cx + twoF, "2F'");

    // lens
    ctx.strokeStyle = isConvex ? "#0ea5e9" : "#8b5cf6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (isConvex) {
      // convex lens: two arcs
      ctx.moveTo(cx, 28);
      ctx.quadraticCurveTo(cx + 12, cy, cx, H - 28);
      ctx.moveTo(cx, 28);
      ctx.quadraticCurveTo(cx - 12, cy, cx, H - 28);
    } else {
      ctx.moveTo(cx, 28);
      ctx.quadraticCurveTo(cx - 12, cy, cx, H - 28);
      ctx.moveTo(cx, 28);
      ctx.quadraticCurveTo(cx + 12, cy, cx, H - 28);
    }
    ctx.stroke();
    ctx.fillStyle = isConvex ? "rgba(14,165,233,0.08)" : "rgba(139,92,246,0.08)";
    ctx.fill();

    // object
    const objX = cx - do_ * scale;
    const objTop = cy - h * 3; // scale height for visibility
    const objBot = cy;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(objX, objBot);
    ctx.lineTo(objX, objTop);
    ctx.stroke();
    // arrow head
    ctx.beginPath();
    ctx.moveTo(objX - 5, objTop + 6);
    ctx.lineTo(objX, objTop);
    ctx.lineTo(objX + 5, objTop + 6);
    ctx.stroke();
    ctx.fillStyle = "#10b981";
    ctx.font = "10px sans-serif";
    ctx.fillText("Object", objX - 18, objBot + 14);

    // image
    if (Number.isFinite(di) && Math.abs(di) < 80) {
      const imgX = cx + di * scale;
      const imgTop = cy - hi * 3;
      const imgBot = cy;
      ctx.strokeStyle = isReal ? "#ef4444" : "#f59e0b";
      ctx.setLineDash(isReal ? [] : [4, 4]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(imgX, imgBot);
      ctx.lineTo(imgX, imgTop);
      ctx.stroke();
      ctx.setLineDash([]);
      if (isReal) {
        ctx.beginPath();
        ctx.moveTo(imgX - 5, imgTop - 6);
        ctx.lineTo(imgX, imgTop);
        ctx.lineTo(imgX + 5, imgTop - 6);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(imgX - 5, imgTop + 6);
        ctx.lineTo(imgX, imgTop);
        ctx.lineTo(imgX + 5, imgTop + 6);
        ctx.stroke();
      }
      ctx.fillStyle = isReal ? "#ef4444" : "#f59e0b";
      ctx.fillText(isReal ? "Real Image" : "Virtual", imgX - 22, imgBot + 14);
      ctx.fillText(`m=${m.toFixed(2)}`, imgX - 14, imgTop - 8);
    }

    // rays
    // Ray 1: parallel from object top -> lens -> through F'
    ctx.strokeStyle = "rgba(16,185,129,0.9)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(objX, objTop);
    ctx.lineTo(cx, objTop);
    // refracted through F'
    const fPrimeX = cx + fPx;
    // line from (cx, objTop) to fPrime direction extend to ground
    // find intersection with image plane or beyond
    const slope1 = (cy - objTop) / (fPrimeX - cx) * (isConvex ? 1 : -1); // simplified
    // more accurate: for convex, ray after lens goes to F' ; for concave diverges as if from F
    if (isConvex) {
      const endX = W - 10;
      const endY = objTop + (endX - cx) * ((cy - objTop) / (fPrimeX - cx));
      // But simpler: use image top if real
      ctx.lineTo(endX, endY);
    } else {
      // concave: diverge, extend backwards
      const endX = W - 10;
      const endY = objTop + (endX - cx) * 0.15; // slight diverge
      ctx.lineTo(endX, endY);
      // virtual backward dashed to F
      ctx.setLineDash([4, 4]);
      ctx.moveTo(cx, objTop);
      ctx.lineTo(cx - fPx, cy);
      ctx.setLineDash([]);
    }
    ctx.stroke();

    // Ray 2: chief ray through center (straight)
    ctx.strokeStyle = "rgba(99,102,241,0.9)";
    ctx.beginPath();
    ctx.moveTo(objX, objTop);
    ctx.lineTo(cx, cy);
    if (Number.isFinite(di)) {
      const imgX = cx + di * scale;
      const imgTop = cy - hi * 3;
      ctx.lineTo(imgX, imgTop);
    } else {
      ctx.lineTo(W - 10, cy + (cy - objTop) * 0.6);
    }
    ctx.stroke();

    // Ray 3: through F -> after lens parallel
    ctx.strokeStyle = "rgba(244,114,182,0.85)";
    ctx.beginPath();
    ctx.moveTo(objX, objTop);
    const fLeftX = cx - fPx;
    // intersect lens at y where line from object to F meets lens
    const t = (cx - objX) / (fLeftX - objX);
    const yAtLens = objTop + t * (cy - objTop);
    ctx.lineTo(cx, yAtLens);
    ctx.lineTo(W - 10, yAtLens);
    ctx.stroke();

  }, [f, do_, h, type, di, m, isConvex, theme]);

  return (
    <div className={`rounded-xl overflow-hidden border shadow ${theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
        <span className={`text-xs font-bold flex items-center gap-2 ${theme === "dark" ? "text-white/90" : "text-slate-700"}`}>🔭 Ray Optics — Thin Lens {isConvex ? "(Convex)" : "(Concave)"}</span>
        <div className={`text-xs font-mono px-2 py-1 rounded-full border ${theme === "dark" ? "bg-white/10 border-white/10" : "bg-white border-slate-200"}`}>1/f = 1/do + 1/di</div>
      </div>
      <canvas ref={canvasRef} width={560} height={240} className="w-full block" />
      <div className={`px-4 py-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs ${theme === "dark" ? "bg-white/[0.03] text-white/70" : "bg-slate-50"}`}>
        <label>Lens <select value={type} onChange={e => setType(e.target.value as any)} className={`ml-2 px-2 py-1 rounded border text-xs ${theme === "dark" ? "bg-slate-700 border-white/10 text-white" : "bg-white border-slate-200"}`}><option value="convex">Convex</option><option value="concave">Concave</option></select></label>
        <label>f {f} cm<input type="range" min={5} max={22} value={f} onChange={e => setF(+e.target.value)} className="w-full mt-1 accent-amber-500" /></label>
        <label>do {do_} cm<input type="range" min={8} max={55} value={do_} onChange={e => setDo(+e.target.value)} className="w-full mt-1 accent-emerald-500" /></label>
        <label>ho {h} cm<input type="range" min={6} max={28} value={h} onChange={e => setH(+e.target.value)} className="w-full mt-1 accent-violet-500" /></label>
      </div>
      <div className={`px-4 py-3 grid grid-cols-3 gap-2 text-xs ${theme === "dark" ? "bg-slate-900/40 border-t border-white/5" : "bg-white border-t"}`}>
        <div className={`rounded-lg border p-2 text-center ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
          <div className={`font-mono font-bold ${isReal ? "text-emerald-500" : "text-amber-500"}`}>{Number.isFinite(di) ? di.toFixed(1) + " cm" : "∞"}</div><div className="opacity-60">Image distance di</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center"><div className="font-mono font-bold text-violet-400">{m.toFixed(2)}</div><div className="opacity-60">Magnification m = -di/do</div></div>
        <div className={`rounded-lg border p-2 text-center ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}><div className={`font-bold ${isReal ? "text-emerald-600" : "text-amber-600"}`}>{Math.abs(di) < 60 && Number.isFinite(di) ? (isReal ? "Real, Inverted" : "Virtual, Erect") : "—"}</div><div className="opacity-60">Image nature</div></div>
      </div>
    </div>
  );
}

// ============ 4. IDEAL GAS ============

function IdealGasSim({ params, theme }: { params: any; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [n, setN] = useState(params?.n ?? params?.moles ?? 1);
  const [T, setTemp] = useState(params?.T ?? params?.temp ?? 300);
  const [P, setP] = useState(params?.P ?? params?.pressure ?? 1.5);
  const R = 0.0821; // L atm / mol K
  const V = (n * R * T) / P; // liters

  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

  useEffect(() => {
    // init particles
    particlesRef.current = Array.from({ length: 22 }, () => ({
      x: Math.random() * 0.8 + 0.1,
      y: Math.random() * 0.6 + 0.15,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = theme === "dark" ? "#0f172a" : "#f8fafc";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // cylinder
      const cylX = 22, cylY = 26, cylW = 220, cylH = 150;
      const volFrac = Math.min(1, Math.max(0.2, V / 60)); // normalize for visual piston height
      const pistonY = cylY + cylH * (1 - volFrac);
      // outer
      ctx.strokeStyle = theme === "dark" ? "#e2e8f0" : "#334155";
      ctx.lineWidth = 2;
      ctx.strokeRect(cylX, cylY, cylW, cylH);
      // piston
      ctx.fillStyle = theme === "dark" ? "#334155" : "#cbd5e1";
      ctx.fillRect(cylX, pistonY - 8, cylW, 10);
      ctx.strokeRect(cylX, pistonY - 8, cylW, 10);
      // pressure label
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.9)" : "#0f172a";
      ctx.font = "10px monospace";
      ctx.fillText(`P ${P.toFixed(2)} atm`, cylX + 6, pistonY - 14);
      ctx.fillText(`V ${V.toFixed(1)} L`, cylX + 6, cylY + 14);
      ctx.fillText(`T ${T} K`, cylX + 6, cylY + 28);

      // particles inside chamber (below piston)
      const speedScale = Math.sqrt(T / 300) * 1.6;
      particlesRef.current.forEach(p => {
        p.x += p.vx * 0.012 * speedScale;
        p.y += p.vy * 0.012 * speedScale;
        if (p.x < 0.05 || p.x > 0.95) p.vx *= -1;
        if (p.y < 0.05 || p.y > 0.95) p.vy *= -1;
        p.x = Math.max(0.05, Math.min(0.95, p.x));
        p.y = Math.max(0.05, Math.min(0.95, p.y));
        const px = cylX + 8 + p.x * (cylW - 16);
        const py = pistonY + 12 + p.y * (cylY + cylH - pistonY - 20);
        if (py > cylY + cylH - 4) return;
        // glow
        ctx.fillStyle = n > 1.5 ? "#f59e0b" : "#0ea5e9";
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(px - 1, py - 1, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      // P-V graph on right
      const gx = 280, gy = 30, gw = 260, gh = 140;
      ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
      ctx.strokeRect(gx, gy, gw, gh);
      // axes
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)";
      ctx.font = "10px sans-serif";
      ctx.fillText("V →", gx + gw - 18, gy + gh + 14);
      ctx.fillText("P", gx - 12, gy + 10);
      // isotherm hyperbola for current n,T: P = nRT / V
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let v = 5; v <= 60; v += 0.5) {
        const p = (n * R * T) / v;
        if (p > 6 || p < 0.3) continue;
        const x = gx + (v / 60) * gw;
        const y = gy + gh - (p / 6) * gh;
        if (v === 5) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // current point
      const cxPt = gx + (V / 60) * gw;
      const cyPt = gy + gh - (P / 6) * gh;
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(cxPt, cyPt, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // label
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.85)" : "#0f172a";
      ctx.font = "11px monospace";
      ctx.fillText(`PV=nRT`, gx + 8, gy + 14);

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [n, T, P, V, theme]);

  return (
    <div className={`rounded-xl overflow-hidden border shadow ${theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
        <span className={`text-xs font-bold flex items-center gap-2 ${theme === "dark" ? "text-white/90" : "text-slate-700"}`}>🧪 Ideal Gas — PV = nRT</span>
        <span className={`text-xs font-mono px-2 py-1 rounded-full border ${theme === "dark" ? "bg-white/10 border-white/10" : "bg-white border-slate-200"}`}>R=0.0821 L·atm/mol·K</span>
      </div>
      <canvas ref={canvasRef} width={560} height={200} className="w-full block" />
      <div className={`px-4 py-3 grid grid-cols-3 gap-3 text-xs ${theme === "dark" ? "bg-white/[0.03] text-white/70" : "bg-slate-50"}`}>
        <label>n {n.toFixed(1)} mol<input type="range" min={0.5} max={3} step={0.1} value={n} onChange={e => setN(+e.target.value)} className="w-full mt-1 accent-violet-600" /></label>
        <label>T {T} K<input type="range" min={200} max={600} step={10} value={T} onChange={e => setTemp(+e.target.value)} className="w-full mt-1 accent-amber-500" /></label>
        <label>P {P.toFixed(2)} atm<input type="range" min={0.5} max={5} step={0.1} value={P} onChange={e => setP(+e.target.value)} className="w-full mt-1 accent-emerald-500" /></label>
      </div>
      <div className={`px-4 py-2 grid grid-cols-3 gap-2 text-xs ${theme === "dark" ? "bg-slate-900/40 border-t border-white/5 text-slate-300" : "bg-white border-t text-slate-600"}`}>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center"><div className="font-mono font-bold text-violet-400">{V.toFixed(1)} L</div><div className="opacity-60">V = nRT/P</div></div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center"><div className="font-mono font-bold text-amber-500">{(n * R * T).toFixed(1)}</div><div className="opacity-60">nRT</div></div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-center"><div className="font-mono font-bold text-emerald-500">{P.toFixed(2)} atm</div><div className="opacity-60">Isotherm hyperbola right</div></div>
      </div>
    </div>
  );
}

// ============ 5. EQUILIBRIUM ============

function EquilibriumSim({ params, theme }: { params: any; theme: string }) {
  const [temp, setTemp] = useState(params?.temp ?? params?.temperature ?? 450);
  const [concN2, setConcN2] = useState(params?.concN2 ?? 1.0);
  const [concH2, setConcH2] = useState(params?.concH2 ?? 1.5);
  const [concNH3, setConcNH3] = useState(params?.concNH3 ?? 0.6);
  const [Kc, setKc] = useState(params?.Kc ?? 0.8);
  // For N2 +3H2 ⇌ 2NH3, Q = [NH3]^2 / ([N2][H2]^3)
  const Q = (concNH3 * concNH3) / (concN2 * Math.pow(concH2, 3) + 1e-6);
  const ratio = Q / Kc;
  const shift = ratio < 0.95 ? "→ Forward (more NH₃)" : ratio > 1.05 ? "← Backward (more N₂, H₂)" : "✓ At Equilibrium";
  const shiftColor = ratio < 0.95 ? "text-emerald-500" : ratio > 1.05 ? "text-amber-500" : "text-violet-500";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = theme === "dark" ? "#0f172a" : "#ffffff";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // three beakers
      const beakers = [
        { label: "N₂", conc: concN2, color: "#0ea5e9", x: 36 },
        { label: "H₂", conc: concH2, color: "#10b981", x: 156 },
        { label: "NH₃", conc: concNH3, color: "#f59e0b", x: 276 },
      ];
      beakers.forEach(b => {
        const bx = b.x, by = 34, bw = 92, bh = 92;
        // glass
        ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);
        // liquid fill height proportional to conc (0-2)
        const fillH = Math.min(bh - 4, Math.max(10, (b.conc / 2.4) * (bh - 8)));
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(bx + 2, by + bh - fillH - 2, bw - 4, fillH);
        ctx.globalAlpha = 1;
        // bubbles animate
        const bubbleY = by + bh - fillH - 2 + (Math.sin(t * 0.08 + b.x) * 3 + 6);
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        ctx.arc(bx + bw / 2 + Math.sin(t * 0.05) * 6, bubbleY + (t % 20), 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.9)" : "#0f172a";
        ctx.font = "11px monospace";
        ctx.fillText(`${b.label} ${b.conc.toFixed(2)} M`, bx + 8, by + bh + 16);
      });

      // arrow reaction
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.9)" : "#334155";
      ctx.font = "13px monospace";
      ctx.fillText("N₂ + 3H₂", 42, 148);
      // double arrow
      ctx.strokeStyle = theme === "dark" ? "#e2e8f0" : "#0f172a";
      ctx.lineWidth = 1.5;
      const ax = 160, ay = 145;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + 70, ay);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax + 70, ay + 6);
      ctx.lineTo(ax, ay + 6);
      ctx.stroke();
      // arrowheads
      ctx.beginPath();
      ctx.moveTo(ax + 70 - 6, ay - 3);
      ctx.lineTo(ax + 70, ay);
      ctx.lineTo(ax + 70 - 6, ay + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax + 6, ay + 3);
      ctx.lineTo(ax, ay + 6);
      ctx.lineTo(ax + 6, ay + 9);
      ctx.stroke();
      ctx.fillText("⇌  2NH₃", 240, 148);

      // Q vs K bar
      const barX = 390, barY = 30, barW = 146, barH = 96;
      ctx.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
      ctx.strokeRect(barX, barY, barW, barH);
      // K marker line
      const kY = barY + barH - 12 - (Math.min(1, Kc / 2) * (barH - 24));
      ctx.strokeStyle = "#8b5cf6";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(barX, kY);
      ctx.lineTo(barX + barW, kY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8b5cf6";
      ctx.font = "10px monospace";
      ctx.fillText(`Kc=${Kc.toFixed(2)}`, barX + barW - 48, kY - 4);
      // Q bar
      const qY = barY + barH - 12 - (Math.min(1, Q / 2) * (barH - 24));
      const qH = barY + barH - 12 - qY;
      ctx.fillStyle = ratio < 0.95 ? "#10b981" : ratio > 1.05 ? "#f59e0b" : "#8b5cf6";
      ctx.fillRect(barX + 22, qY, barW - 44, qH);
      ctx.fillStyle = theme === "dark" ? "rgba(255,255,255,0.85)" : "#0f172a";
      ctx.fillText(`Q=${Q.toFixed(2)}`, barX + 18, qY - 6);
      // label
      ctx.font = "10px sans-serif";
      ctx.fillText("Q vs Kc", barX + barW / 2 - 16, barY + barH + 14);

      // temp effect
      ctx.fillStyle = theme === "dark" ? "rgba(251,146,60,0.9)" : "#ea580c";
      ctx.font = "11px monospace";
      ctx.fillText(`T = ${temp} K`, barX, 148);
      ctx.fillText(shift, barX, 164);

      t += 1;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [concN2, concH2, concNH3, Kc, Q, ratio, theme, temp]);

  return (
    <div className={`rounded-xl overflow-hidden border shadow ${theme === "dark" ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
        <span className={`text-xs font-bold flex items-center gap-2 ${theme === "dark" ? "text-white/90" : "text-slate-700"}`}>⚗️ Chemical Equilibrium — N₂ + 3H₂ ⇌ 2NH₃</span>
        <span className={`text-xs font-mono px-2 py-1 rounded-full border font-bold ${shiftColor} ${theme === "dark" ? "bg-white/10 border-white/10" : "bg-white border-slate-200"}`}>Q={Q.toFixed(2)} / Kc={Kc.toFixed(2)}</span>
      </div>
      <canvas ref={canvasRef} width={560} height={180} className="w-full block" />
      <div className={`px-4 py-3 grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs ${theme === "dark" ? "bg-white/[0.03] text-white/70" : "bg-slate-50"}`}>
        <label>N₂ {concN2.toFixed(2)}<input type="range" min={0.2} max={2.2} step={0.1} value={concN2} onChange={e => setConcN2(+e.target.value)} className="w-full mt-1 accent-sky-500" /></label>
        <label>H₂ {concH2.toFixed(2)}<input type="range" min={0.2} max={2.2} step={0.1} value={concH2} onChange={e => setConcH2(+e.target.value)} className="w-full mt-1 accent-emerald-500" /></label>
        <label>NH₃ {concNH3.toFixed(2)}<input type="range" min={0.1} max={2.2} step={0.1} value={concNH3} onChange={e => setConcNH3(+e.target.value)} className="w-full mt-1 accent-amber-500" /></label>
        <label>Kc {Kc.toFixed(2)}<input type="range" min={0.1} max={2.5} step={0.1} value={Kc} onChange={e => setKc(+e.target.value)} className="w-full mt-1 accent-violet-600" /></label>
        <label>T {temp}K<input type="range" min={300} max={800} step={10} value={temp} onChange={e => setTemp(+e.target.value)} className="w-full mt-1 accent-orange-500" /></label>
      </div>
      <div className={`px-4 py-2 text-xs ${theme === "dark" ? "bg-slate-900/40 border-t border-white/5" : "bg-white border-t"} ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
        <span className="font-mono">Q = [NH₃]² / ([N₂][H₂]³) = <b className={shiftColor}>{Q.toFixed(3)}</b></span> • <span className={`${shiftColor} font-bold`}>{shift}</span> — Le Chatelier: if Q &lt; K, forward; if Q &gt; K, backward
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
