# shadow — Perfect Project Script (JEET AI duplicate, no demo)

This branch `arena/ca8145b2-shadow` is a **perfect duplicate of JEET AI** with name changed to **shadow** — **live-only, no demo/mocks**.

## What was remembered & perfected

### 1. Branding: JEET AI → shadow
- `package.json` / `package-lock.json`: `shadow@1.0.0`
- `public/manifest.json`: name/short_name `shadow`
- `app/layout.tsx`: title `shadow - Personal 1-on-1 AI Tutor`
- `components/Navbar.tsx`: `shadow AI TUTOR` badge
- `components/VirtualBoard.tsx`: `shadow Board` footer
- `app/*`: all hero/copy, spoken scripts, prompts updated to `shadow`
- `lib/prompts.ts`: tutor/vision prompts `You are shadow...`
- `lib/storage.ts`: keys `shadow_*` with `jeet_*` legacy migration
- `.env.example` / `README.md`: all JEET AI → shadow

### 2. Full Syllabus — Class 11 + Class 12 (your request: both)
- `lib/syllabus.ts`: Added `CLASS11` and `CLASS12` as first-class Exams (type `Exam` now 6 values)
- **CLASS11**: 10 Physics + 10 Chemistry + 5 Biology + 7 Maths = 32 chapters (NCERT names: Physical World, Thermodynamics, Equilibrium, Cell, Sets, etc.)
- **CLASS12**: 10 Physics + 7 Chemistry + 5 Biology + 7 Maths = 29 chapters (Electrostatics, Matrices, Reproduction, Genetics, etc.)
- JEE/NEET now marked `Full 11+12`, CBSE10/CBSE12 kept
- **All statuses now `not-started` (no demo seed)** — progress starts at 0% fresh, grows live from your lessons/tests (localStorage `shadow_progress_v1`). Previous demo seed (17%/8 weak) removed per "no demo" request.
- `app/page.tsx`: Exam switch handles all 6; syllabus tree searchable; dashboard progress is LIVE (localStorage) not seed.

### 3. Full Internet — not demo, live-only (your choice: env_key)
- `.env.example`: documents `.env` OR `.env.local` with `GEMINI_API_KEY` (process.env) — no mocks
- `app/api/tutor`, `quiz`, `vision-doubt`: **REMOVED all `mock*` fallbacks** — if no `GEMINI_API_KEY` (header `x-gemini-key` or env), returns `503` with message: `shadow requires GEMINI_API_KEY — add in .env or ⚙️ Settings. No demo.`
- `lib/prompts.ts`: strict NCERT grounding + simulation_widget triggers (projectile/pendulum/ray_optics/ideal_gas/equilibrium)
- `lib/mock.ts`: kept but **not used** (deprecated) — live-only guarantees duplicate of JEET AI real flow
- `app/page.tsx` + `app/classroom/page.tsx`: banners show `shadow LIVE — Gemini connected` (green) vs `shadow requires GEMINI_API_KEY` (dark) — no Demo Mock wording anymore

### 4. NEET & Practice Unlimited (your request: both 11+12, unlimited)
- `app/practice/page.tsx`: Exam options 6, counts 5/10/15/30/50 + custom 1-100; hint shows `.env` live
- `app/api/quiz`: `maxOutputTokens` scaled with `count` (up to 8192), no mock padding, strict error handling
- `lib/mock.ts` earlier extended to cycle, now bypassed for live
- Practice uses full 11+12 syllabus when exam=JEE/NEET

### 5. Perfect Project Script
- `setup.ps1` (Windows PowerShell) — one-click, handles ExecutionPolicy via `npm.cmd`, checks Node 18+, creates `.env`, prompts for GEMINI key, `npm.cmd install`, `npm.cmd run build`, offers `npm.cmd run dev`
- `setup.sh` (Linux/macOS) — same for bash, `npm install`/`npm run build`
- Both remember ALL changes above — running them recreates perfect duplicate
- Handles double-folder zip trap you hit (`shadow-arena-ca8145b2-shadow/shadow-arena-ca8145b2-shadow`)

## Quick Start (Perfect Script)

**Windows (you: Patna, PowerShell):**
```powershell
# If using ZIP (no git):
Expand-Archive -Path shadow-arena-ca8145b2-shadow.zip -DestinationPath C:\Users\ASUS\Downloads -Force
cd "C:\Users\ASUS\Downloads\shadow-arena-ca8145b2-shadow\shadow-arena-ca8145b2-shadow"
powershell -ExecutionPolicy Bypass -File setup.ps1
# or: .\setup.ps1
# Enter Gemini key when prompted (https://aistudio.google.com/app/apikey)
```

**Linux/macOS:**
```bash
chmod +x setup.sh && ./setup.sh
```

**Manual (if script not used):**
```bash
cp .env.example .env
notepad .env  # or nano .env — set GEMINI_API_KEY=AIza...
npm install   # or npm.cmd install on Windows
npm run build
npm run dev   # -> http://localhost:3000
```

Branch: `arena/ca8145b2-shadow` — `git archive` HEAD is the perfect ZIP (144K). All commits pushed, build passes (`shadow@1.0.0`).

No limits, no paywall, no demo — exact JEET AI duplicate as `shadow`.
