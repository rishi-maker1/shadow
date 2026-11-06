"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, MessageCircle, Camera, ClipboardCheck, Settings, Sparkles, BookMarked } from "lucide-react";
import { useState } from "react";
import SettingsModal from "./SettingsModal";

export default function Navbar() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  const nav = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/classroom", label: "Live Classroom", icon: MessageCircle },
    { href: "/open-session", label: "Doubt Solver", icon: Camera },
    { href: "/practice", label: "Practice & Tests", icon: ClipboardCheck },
    { href: "/materials", label: "My Study Material", icon: BookMarked },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 leading-none tracking-tight flex items-center gap-1.5">
                    JEET AI <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-amber-900">PERSONAL</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 tracking-wide">1-on-1 Live Tutor • JEE • NEET • CBSE</div>
                </div>
              </Link>
              <nav className="hidden lg:flex items-center gap-1">
                {nav.map((n) => {
                  const active = pathname === n.href;
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition ${
                        active ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <n.icon className="w-4 h-4" />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Unlimited Access • No Limits
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black transition shadow"
                title="Settings - API Keys"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Mobile nav */}
          <div className="lg:hidden flex items-center gap-2 pb-3 overflow-x-auto">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                    active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  <n.icon className="w-3.5 h-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
