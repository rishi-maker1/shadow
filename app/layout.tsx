import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JEET AI - Personal 1-on-1 AI Tutor | JEE • NEET • CBSE",
  description: "Your personal live AI teacher for JEE, NEET, Foundation and CBSE Boards. Interactive board, voice, vision doubt solver, mock tests & more.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
