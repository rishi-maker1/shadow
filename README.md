# JEET AI — Personal 1-on-1 Live AI Tutor

> Inspired by **JEET AI** — a personal 1-on-1 live AI teacher for **JEE, NEET, Foundation, and CBSE Boards**. This is a **full-stack personal-use build** with **no payment gateways, no subscriptions, no hour limits**.

Live classroom with a Virtual Teaching Board (dark chalkboard / light whiteboard), voice barge-in, Hinglish support, vision doubt solver, and JEE/NEET-style practice tests with “Teach My Mistake”.

---

## ✨ Features

### 1. Dashboard & Syllabus Course Tree
- Exam selector: **JEE (PCM), NEET (PCB), CBSE 10 & 12**
- Pre-populated realistic chapters & subtopics for Physics / Chemistry / Maths / Biology
- Progress tracker — Completed / In-Progress / Weak per chapter (locally persisted)

### 2. Live 1-on-1 Interactive Classroom (Active Teaching Mode)
- **Split-screen:** Left = Virtual Teaching Board, Right = Live Conversation & Controls
- Board renders structured JSON: `board_title`, `board_blocks` (markdown + KaTeX), `svg_or_diagram` (Mermaid), `simulation_widget` (Canvas), `spoken_script`, `checkpoint_question`
- **Progressive step reveal** synced with speech, annotations/highlights
- **Pedagogical Loop:** teaches in chunks → **must ask checkpoint question** → adapts if you’re wrong or click *Explain Differently / Simpler*
- **Voice & Barge-In:** Web Speech API TTS (`hi-IN` / `en-IN`, selectable voices, adjustable speed) + STT mic input; `speechSynthesis.cancel()` on mic click for instant interrupt
- **Language Toggle:** English / Hindi / Hinglish (Hinglish = Hindi+English mix with technical terms in English)

### 3. Open Session — 24×7 Doubt Solver (Photo Upload)
- Freeform session without picking a chapter
- Upload / drag-drop / **paste (Ctrl+V)** image, or speak/type doubt
- Vision extracts problem via `/api/vision-doubt` (Gemini vision) → displays on board → **step-by-step walkthrough, not final-answer dump**

### 4. Practice Sets, Mock Tests & “Explain My Mistake”
- Chapter-wise MCQs + Numerical (+4 / -1 marking) with timer
- Diagnostic report: accuracy, weak subtopics, step-by-step solutions
- **“Ask AI Tutor to Teach This Mistake”** on every question → opens Live Classroom pre-loaded with that question + your wrong answer + concept

### 5. PWA & Persistence
- Local persistence via **localStorage + JSON fallback** (progress, transcripts, test mistakes). SQLite (`better-sqlite3` / Prisma) can be added; current build keeps it zero-native-deps for easy deploy.
- `.env.example`, `.gitignore`, `manifest.json`, `README` included
- Dev server binds to `0.0.0.0` for Arena Live Preview

---

## 🧱 Tech Stack

- **Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons**
- **KaTeX** for math/physics/chemistry, **Mermaid** + **HTML5 Canvas** for diagrams & simulations
- AI routes: `/api/tutor`, `/api/quiz`, `/api/vision-doubt` — support `GEMINI_API_KEY` (env) + client-side key via Settings modal (saved locally, sent as `x-gemini-key` header)

---

## 🚀 Local Setup

```bash
# 1. Clone
git clone <your-repo> jeet-ai && cd jeet-ai

# 2. Install
npm install

# 3. Env
cp .env.example .env.local
# Edit .env.local — add your Gemini key:
# GEMINI_API_KEY=your_key_here
# Get one at https://aistudio.google.com/app/apikey

# 4. Run (binds to 0.0.0.0 for Live Preview)
npm run dev
# → http://localhost:3000  (or preview host in Arena)

# 5. Build
npm run build && npm start
```

No API key? The app **falls back to high-quality mock lessons/quizzes** so you can demo everything offline.

**In-app key:** Open the ⚙️ Settings modal (top-right) and paste your `GEMINI_API_KEY` — it’s stored in `localStorage` only and sent as `x-gemini-key` header, so Live Preview works without restarting the server.

---

## 🔑 Environment Variables

See `.env.example`:

```
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here   # optional fallback
NEXT_PUBLIC_APP_NAME="JEET AI - Personal Tutor"
```

Use either `GEMINI_API_KEY` in `.env.local` **or** the Settings modal. The API routes prefer the header (`x-gemini-key`) then `process.env.GEMINI_API_KEY`.

---

## 📁 Project Structure

```
app/
  layout.tsx, globals.css, page.tsx              # Dashboard
  classroom/page.tsx                              # Live Classroom
  open-session/page.tsx                           # Doubt Solver
  practice/page.tsx                               # Tests & diagnostic
  api/tutor/route.ts, api/quiz/route.ts, api/vision-doubt/route.ts
components/
  Navbar.tsx, VirtualBoard.tsx, SettingsModal.tsx
lib/
  syllabus.ts  # realistic JEE/NEET/CBSE data
  storage.ts   # localStorage helpers
  prompts.ts   # system prompts enforcing board JSON + pedagogy
  mock.ts      # fallback mock responses
public/manifest.json
```

---

## 🎙️ Voice & Barge-In Details

- TTS: `window.speechSynthesis` with voice selector (filters `hi-IN` / `en-IN`), rate slider
- STT: `webkitSpeechRecognition` / `SpeechRecognition` with `hi-IN` / `en-IN`
- **Barge-in:** `window.speechSynthesis.cancel()` is called instantly on Mic click / speech start, so you can interrupt mid-sentence naturally

---

## 🧪 KaTeX & Diagrams

- Inline `$...$` and display `$$...$$` are rendered via `katex` (`renderToString`)
- `svg_or_diagram` is rendered as **Mermaid** (graph, flowchart) or raw SVG. Canvas simulations (e.g., projectile) use HTML5 Canvas with interactive sliders.

---

## 📦 Build & PWA

- `npm run build` must pass (TypeScript strict)
- `public/manifest.json` enables “Add to Home Screen”; extend with service worker if needed
- `.gitignore` ignores `.env*`, `node_modules`, `.next`, `*.db`

---

## 📝 License

Personal-use project. No payment code included by design.

---

Made with ❤️ for toppers — **JEET AI, your personal teacher, unlimited.**
