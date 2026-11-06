"use client";
import { useEffect, useState } from "react";
import { X, Key, Eye, EyeOff, Save, ExternalLink, Check, Sparkles } from "lucide-react";
import { getApiKeys, saveApiKeys } from "@/lib/storage";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [gemini, setGemini] = useState("");
  const [openai, setOpenai] = useState("");
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const keys = getApiKeys();
    setGemini(keys.gemini);
    setOpenai(keys.openai);
  }, []);

  const handleSave = () => {
    saveApiKeys({ gemini, openai });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideIn">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold leading-none">API Settings</h2>
              <p className="text-xs text-indigo-100">Keys are stored locally in your browser only</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-amber-800">
              <b>Live Preview tip:</b> Paste your Gemini key here to test instantly. Without a key, the app uses high-quality mock lessons so you can demo everything offline.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">G</span>
              Gemini API Key
              <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-xs font-normal text-indigo-600 flex items-center gap-1 hover:underline">
                Get key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="mt-2 relative">
              <input
                type={showGemini ? "text" : "password"}
                value={gemini}
                onChange={(e) => setGemini(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
              <button onClick={() => setShowGemini(!showGemini)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Used for /api/tutor, /api/quiz, /api/vision-doubt</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">O</span>
              OpenAI API Key <span className="text-xs font-normal text-slate-400">(optional fallback)</span>
            </label>
            <div className="mt-2 relative">
              <input
                type={showOpenai ? "text" : "password"}
                value={openai}
                onChange={(e) => setOpenai(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
              <button onClick={() => setShowOpenai(!showOpenai)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-black transition"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved locally!" : "Save Keys Locally"}
            </button>
            <button onClick={onClose} className="px-6 py-3 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50">
              Close
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            Env variable <code className="px-1 py-0.5 bg-slate-100 rounded">GEMINI_API_KEY</code> is used on server if set. Client key overrides via <code className="px-1 py-0.5 bg-slate-100 rounded">x-gemini-key</code> header.
          </p>
        </div>
      </div>
    </div>
  );
}
