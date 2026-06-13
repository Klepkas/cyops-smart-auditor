# Smart Contract Auditor

> A polished, dark-themed web app that simulates a multi-agent Solidity
> vulnerability scan and renders a styled audit report — built with Vite,
> React, TypeScript, and Tailwind CSS.

## What it does

- A persistent left **sidebar** for navigation across Dashboard, Auditor,
  Scan History, and Settings.
- A **Solidity code editor** with syntax highlighting and line numbers.
- A **multi-agent scan** that cycles through Static Analyzer → Symbolic
  Executor → AI Security Reviewer → Gas Optimizer, with per-agent progress
  indicators and a cancel button.
- A polished **audit report** with an overall Risk Score, vulnerabilities
  grouped by severity, detailed remediation suggestions, and gas-optimisation
  tips.
- **Scan history** (persisted to `localStorage`) and a **Dashboard** that
  summarises aggregate metrics.

> ⚠️ The "scan" is a **deterministic client-side simulation** — there is no
> real Slither/Mythril integration in v1. Re-scanning the same code yields
> the same report.

## Stack

| Concern        | Choice                                              |
|----------------|-----------------------------------------------------|
| Build / dev    | Vite 5                                              |
| UI framework   | React 18                                            |
| Language       | TypeScript 5 (strict)                               |
| Styling        | Tailwind CSS 3.4                                    |
| Routing        | `react-router-dom` v6                               |
| Code editor    | CodeMirror 6 via `@uiw/react-codemirror`            |
| Charts         | Recharts                                            |
| Icons          | `lucide-react`                                      |

## Prerequisites

- Node.js **≥ 18.17** (Node 20+ recommended)
- npm 9+ (or pnpm / yarn — examples below use npm)

## Setup

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev          # → http://localhost:5173

# 3. production build
npm run build        # → dist/

# 4. preview the production build locally
npm run preview      # → http://localhost:4173
```

## Scripts

| Script              | Purpose                                       |
|---------------------|-----------------------------------------------|
| `npm run dev`       | Start the Vite dev server.                    |
| `npm run build`     | Type-check and produce a production build.    |
| `npm run preview`   | Serve the production build locally.           |
| `npm run typecheck` | Run `tsc --noEmit` to verify types.           |

## Project structure

```
src/
  App.tsx                 # Router shell
  main.tsx                # React entry
  index.css               # Global styles + Tailwind directives
  components/
    layout/               # Layout, Sidebar, Topbar
    ui/                   # Buttons, Cards, Drawer, Modal, …
    editor/               # CodeEditor (CodeMirror wrapper)
    audit/                # RiskScoreGauge, VulnerabilityTable, …
    dashboard/            # StatCard, TrendChart
    history/              # HistoryRow
  pages/                  # Dashboard, Auditor, History, Settings
  hooks/                  # useScan, useScanHistory, useSettings
  lib/                    # scanEngine, reportTypes, severity, storage
  data/                   # sampleContract, vulnerabilityPatterns
```

## Status

This README is a placeholder for the AC-1 bootstrap; the full setup, design
notes, and "simulated-scan caveat" sections will be expanded in AC-12.
