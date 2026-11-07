#!/usr/bin/env bash
# shadow — Perfect JEET AI duplicate (Live-only, no demo)
# One-click setup for Linux / macOS / Git Bash
# Features: Full Class 11/12 + NEET unlimited via Gemini, full syllabus, shadow branding, live-only (no mocks)
# Run: chmod +x setup.sh && ./setup.sh

set -e
echo ""
echo "shadow — Perfect JEET AI Duplicate Setup"
echo "1-on-1 Live Tutor • JEE • NEET • CBSE • Class 11/12 • No limits, no demo"
echo ""

echo "[1/6] Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo "ERROR: node not found. Install from https://nodejs.org (LTS)"
  exit 1
fi
echo "  Node $(node -v) OK"

echo "[2/6] Checking npm..."
if ! command -v npm &>/dev/null; then
  echo "ERROR: npm not found"
  exit 1
fi
echo "  npm $(npm -v) OK"

echo "[3/6] Setting up .env..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "  Created .env from .env.example"
  else
    echo "  .env.example not found!"
  fi
else
  echo "  .env already exists — keeping it"
fi

if grep -q "your_gemini_api_key_here" .env 2>/dev/null || ! grep -q "GEMINI_API_KEY=AIza" .env 2>/dev/null; then
  echo ""
  echo "  shadow is LIVE-ONLY (no demo) — requires GEMINI_API_KEY"
  echo "  Get free key: https://aistudio.google.com/app/apikey"
  echo ""
  read -p "  Paste GEMINI_API_KEY (or Enter to skip): " key
  if [ -n "$key" ] && [ ${#key} -gt 10 ]; then
    if grep -q "^GEMINI_API_KEY=" .env; then
      # replace line (GNU/BSD compatible)
      if sed --version &>/dev/null; then
        sed -i "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$key|" .env
      else
        sed -i '' "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$key|" .env
      fi
    else
      echo "GEMINI_API_KEY=$key" >> .env
    fi
    echo "  Saved to .env"
  else
    echo "  Skipped — add later via .env or in-app Settings"
  fi
else
  echo "  GEMINI_API_KEY already set"
fi

echo ""
echo "[4/6] Installing dependencies..."
npm install

echo ""
echo "[5/6] Building..."
npm run build

echo ""
echo "[6/6] Done! shadow is ready."
echo ""
echo "Run live server:"
echo "  npm run dev"
echo "  -> http://localhost:3000  (header shadow, green banner = live)"
echo ""
echo "Notes:"
echo " - Perfect duplicate of JEET AI: Dashboard, Syllabus Tree (JEE/NEET/CLASS11/CLASS12), Live Classroom (VirtualBoard + KaTeX + Mermaid + simulations), Study Material (NCERT upload), Open Session vision, Practice unlimited live-only"
echo " - No demo/mocks: without key APIs return 503. Add key in .env or Settings and restart."
echo " - Progress starts 0% fresh, live tracking in localStorage"
echo ""
read -p "Start dev server now? (y/N): " run
if [[ "$run" == "y" || "$run" == "Y" ]]; then
  npm run dev
fi
