# shadow — Personal 1-on-1 Live AI Tutor

> **shadow** — a personal 1-on-1 live AI teacher for **JEE, NEET, Foundation, and CBSE Boards**. This is a **full-stack personal-use build** with **no payment gateways, no subscriptions, no hour limits**.

Live classroom with a Virtual Teaching Board (dark chalkboard / light whiteboard), voice barge-in, Hinglish support, vision doubt solver, and JEE/NEET-style practice tests with “Teach My Mistake”.

---

## ✨ Features

### 1. Dashboard & Syllabus Course Tree
- Exam selector: **JEE (Full 11+12), NEET (Full 11+12), CLASS11, CLASS12, CBSE 10 & 12** — full NCERT chapters (Physics/Chem/Bio/Maths)
- Pre-populated realistic chapters & subtopics for Physics / Chemistry / Maths / Biology (32+29 chapters for 11/12)
- Progress tracker — Completed / In-Progress / Weak per chapter (locally persisted, starts at 0% fresh — no demo seed)

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

## 🚀 Local Setup — Perfect Project Script (Live-only, no demo)

**Windows PowerShell (one-click):**
```powershell
# ZIP (no git needed):
Expand-Archive -Path shadow-arena-ca8145b2-shadow.zip -DestinationPath C:\Users\ASUS\Downloads -Force
cd "C:\Users\ASUS\Downloads\shadow-arena-ca8145b2-shadow\shadow-arena-ca8145b2-shadow"
powershell -ExecutionPolicy Bypass -File setup.ps1
# -> prompts for GEMINI_API_KEY, does npm.cmd install + build, offers run
```

**Linux / macOS / Git Bash:**
```bash
chmod +x setup.sh && ./setup.sh
# or manual:
git clone <your-repo> shadow && cd shadow
cp .env.example .env
# Edit .env — add GEMINI_API_KEY=AIza...  (https://aistudio.google.com/app/apikey)
npm install
npm run build
npm run dev
# -> http://localhost:3000
```

**Perfect duplicate:** This is a **live-only** duplicate of JEET AI — **no demo/mocks**. Without `GEMINI_API_KEY` (in `.env` or via `⚙️ Settings` modal), APIs return `503` (not mock). `setup.ps1` / `setup.sh` remember ALL changes (Class 11/12 expansion, unlimited practice, shadow branding, NCERT grounding) and recreate the perfect project.
**In-app key:** Open ⚙️ Settings (top-right) and paste `GEMINI_API_KEY` — stored in `localStorage` (`shadow_api_keys_v1`) and sent as `x-gemini-key` header.

---

## 🔑 Environment Variables

See `.env.example`:

```
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here   # optional fallback
NEXT_PUBLIC_APP_NAME="shadow"
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
  syllabus.ts  # realistic JEE/NEET/CLASS11/CLASS12/CBSE (32+29 ch, all not-started fresh)
  storage.ts   # localStorage helpers (shadow_* keys)
  prompts.ts   # system prompts enforcing board JSON + pedagogy (shadow)
  mock.ts      # deprecated — live-only now, not used
public/manifest.json
setup.ps1 / setup.sh  # perfect project scripts (one-click JEET AI → shadow)
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

Made with ❤️ for toppers — **shadow, your personal teacher, unlimited.**
