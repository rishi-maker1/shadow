# shadow — Perfect JEET AI duplicate (Live-only, no demo)
# One-click setup for Windows PowerShell — remembers ALL changes
# Features: Full Class 11/12 + NEET unlimited via Gemini, full syllabus, shadow branding, live-only (no mocks), NCERT grounding, PWA
# Run: powershell -ExecutionPolicy Bypass -File setup.ps1
# Or:  .\setup.ps1

Write-Host "`nshadow — Perfect JEET AI Duplicate Setup" -ForegroundColor Cyan
Write-Host "1-on-1 Live Tutor • JEE • NEET • CBSE • Class 11/12 • No limits, no demo`n" -ForegroundColor Gray

# 1. Check Node
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
try {
  $nodeV = node -v
  Write-Host "  Node $nodeV OK" -ForegroundColor Green
  $major = [int]($nodeV.TrimStart('v').Split('.')[0])
  if ($major -lt 18) { Write-Host "  WARN: Node 18+ recommended. You have $nodeV" -ForegroundColor Yellow }
} catch {
  Write-Host "  ERROR: Node not found. Install from https://nodejs.org (LTS) and rerun." -ForegroundColor Red
  Write-Host "  After install, close and reopen PowerShell, then run again: .\setup.ps1" -ForegroundColor Yellow
  exit 1
}

# 2. Check npm (use npm.cmd on Windows to bypass ExecutionPolicy)
Write-Host "[2/6] Checking npm..." -ForegroundColor Yellow
try {
  $npmV = npm.cmd -v 2>$null
  if (-not $npmV) { $npmV = npm -v }
  Write-Host "  npm $npmV OK" -ForegroundColor Green
} catch {
  Write-Host "  ERROR: npm not found. Reinstall Node.js." -ForegroundColor Red
  exit 1
}

# 3. Env file
Write-Host "[3/6] Setting up .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host "  Created .env from .env.example" -ForegroundColor Green
  } else {
    Write-Host "  .env.example not found!" -ForegroundColor Red
  }
} else {
  Write-Host "  .env already exists — keeping it" -ForegroundColor Green
}

# Prompt for GEMINI key if missing or placeholder
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue | Out-String
if ($envContent -match "your_gemini_api_key_here" -or $envContent -notmatch "GEMINI_API_KEY=AIza") {
  Write-Host "`n  shadow is LIVE-ONLY (no demo) — requires GEMINI_API_KEY for JEET AI duplicate." -ForegroundColor Magenta
  Write-Host "  Get free key: https://aistudio.google.com/app/apikey`n" -ForegroundColor Gray
  $key = Read-Host "  Paste GEMINI_API_KEY (starts with AIza) or press Enter to skip for now"
  if ($key -and $key.Trim().Length -gt 10) {
    $key = $key.Trim()
    # Replace or add line
    $lines = Get-Content ".env"
    $found = $false
    $newLines = $lines | ForEach-Object {
      if ($_ -match "^GEMINI_API_KEY=") { $found = $true; "GEMINI_API_KEY=$key" } else { $_ }
    }
    if (-not $found) { $newLines += "GEMINI_API_KEY=$key" }
    Set-Content -Path ".env" -Value $newLines
    Write-Host "  Saved GEMINI_API_KEY to .env" -ForegroundColor Green
  } else {
    Write-Host "  Skipped — you can add later via notepad .env or in-app ⚙️ Settings" -ForegroundColor Yellow
  }
} else {
  Write-Host "  GEMINI_API_KEY already set in .env" -ForegroundColor Green
}

# 4. Install deps
Write-Host "`n[4/6] Installing dependencies (npm.cmd install)..." -ForegroundColor Yellow
npm.cmd install
if ($LASTEXITCODE -ne 0) {
  Write-Host "  npm install failed. Try: npm.cmd install --legacy-peer-deps" -ForegroundColor Red
  exit 1
}

# 5. Build
Write-Host "`n[5/6] Building (npm.cmd run build)..." -ForegroundColor Yellow
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "  Build failed — check errors above" -ForegroundColor Red
  exit 1
}

# 6. Done
Write-Host "`n[6/6] Done! shadow is ready." -ForegroundColor Green
Write-Host "`nRun live server:" -ForegroundColor Cyan
Write-Host "  npm.cmd run dev" -ForegroundColor White
Write-Host "  -> http://localhost:3000  (header shows shadow, banner GREEN = live)`n" -ForegroundColor Gray
Write-Host "Notes:" -ForegroundColor Yellow
Write-Host " - This is a perfect duplicate of JEET AI flow: Dashboard, Syllabus Tree (JEE/NEET/CLASS11/CLASS12/CBSE10/12), Live Classroom (VirtualBoard dark/light + KaTeX + Mermaid + 5 simulations), My Study Material (NCERT upload chunk 900/120), Open Session vision, Practice unlimited (1-100, mock removed — live only), PWA." -ForegroundColor Gray
Write-Host " - No demo/mocks: without GEMINI_API_KEY the API returns 503. Add key in .env or in-app Settings (⚙️) and restart." -ForegroundColor Gray
Write-Host " - Progress starts at 0% (no demo seed) and grows live from your lessons, stored in localStorage (shadow_*)`n" -ForegroundColor Gray

$run = Read-Host "Start dev server now? (y/N)"
if ($run -eq "y" -or $run -eq "Y") {
  npm.cmd run dev
}
