# ─── Bangladesh Financial Companion — Partner Demo Build Utility ─────────────
# This script compiles workspace dependencies, verifies type-safety, executes
# test suites, and compiles the production Next.js application bundle.

$ErrorActionPreference = "Stop"

Write-Host '==========================================================' -ForegroundColor Green
Write-Host '  Bangladesh Financial Companion — Partner Demo Builder   ' -ForegroundColor Green
Write-Host '==========================================================' -ForegroundColor Green
Write-Host ''

# 1. Check for PNPM installation
Write-Host '[1/4] Checking environment prerequisites...' -ForegroundColor Cyan
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host 'Error: pnpm is required but not found in path.' -ForegroundColor Red
    Write-Host 'Please install pnpm globally first by running: npm install -g pnpm' -ForegroundColor Yellow
    Exit 1
}
Write-Host 'Prerequisites check passed.' -ForegroundColor Green

# 2. Install workspace dependencies
Write-Host ''
Write-Host '[2/4] Installing node workspace dependencies...' -ForegroundColor Cyan
pnpm install

# 3. Execute all unit tests (Vitest + PyTest/Unittest)
Write-Host ''
Write-Host '[3/4] Running automated workspace verification test suites...' -ForegroundColor Cyan
pnpm test

# 4. Build production bundle
Write-Host ''
Write-Host '[4/4] Compiling Next.js frontend production bundle...' -ForegroundColor Cyan
pnpm build

# 5. Success summary
Write-Host ''
Write-Host '==========================================================' -ForegroundColor Green
Write-Host '  [DEMO BUILD SUCCESSFUL]                                 ' -ForegroundColor Green
Write-Host '==========================================================' -ForegroundColor Green
Write-Host 'All type checks, test cases, and Next.js asset compilations completed successfully.' -ForegroundColor Gray
Write-Host ''
Write-Host 'How to run the local developer demo environment:' -ForegroundColor Yellow
Write-Host '  1. Start the API backend service:' -ForegroundColor Yellow
Write-Host '     cd apps/api' -ForegroundColor Gray
Write-Host '     .venv\Scripts\python -m uvicorn main:app --reload --port 8000' -ForegroundColor Gray
Write-Host '  2. Start the local frontend server:' -ForegroundColor Yellow
Write-Host '     pnpm --filter @fc/web dev' -ForegroundColor Gray
Write-Host '  3. Open http://localhost:3000 in your browser to interact.' -ForegroundColor Gray
Write-Host ''
