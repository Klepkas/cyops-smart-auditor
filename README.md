# Smart Contract Auditor

> A polished, dark-themed web app that simulates a multi-agent Solidity
> vulnerability scan and renders a styled audit report — built with Vite,
> React, TypeScript, and Tailwind CSS.

## What it does

- A persistent left **sidebar** for navigation across Dashboard, Auditor,
  Scan History, and Settings. Collapses to a hamburger drawer below
  `1024 px`.
- A **Solidity code editor** with syntax highlighting, line numbers, and
  horizontal scroll for long lines.
- A **multi-agent scan** that cycles through Static Analyzer → Symbolic
  Executor → AI Security Reviewer → Gas Optimizer, with per-agent
  progress indicators and a cancel button.
- A polished **audit report** with an overall Risk Score (colour-coded
  gauge), vulnerabilities grouped by severity, detailed remediation
  suggestions, and gas-optimisation tips.
- **Scan history** persisted to `localStorage` (capped at 100 entries)
  and a **Dashboard** with aggregate metrics + a trend sparkline of the
  last 10 scans.
- **Settings** page for default Solidity version, risk-score
  sensitivity, and a destructive "Reset all data" with a confirmation
  modal.

> ⚠️ **Simulated scan** — the multi-agent pipeline is a **deterministic
> client-side simulation**. There is no real Slither/Mythril/Foundry
> integration in v1. The same source code always produces the same
> report (the RNG is seeded by a FNV-1a hash of the source). The
> vulnerability bank is a curated 8-rule regex set that covers the
> classic Solidity foot-guns (reentrancy, `tx.origin`, unchecked
> low-level call, `block.timestamp` randomness, `delegatecall`,
> `selfdestruct`, floating pragma, magic numbers). Treat the findings
> as educational, not as a security audit.

## Stack

| Concern        | Choice                                              |
|----------------|-----------------------------------------------------|
| Build / dev    | Vite 5                                              |
| UI framework   | React 18                                            |
| Language       | TypeScript 5 (`strict`, `noUncheckedIndexedAccess`) |
| Styling        | Tailwind CSS 3.4                                    |
| Routing        | `react-router-dom` v6                               |
| Code editor    | CodeMirror 6 via `@uiw/react-codemirror`            |
| Charts         | Recharts                                            |
| Icons          | `lucide-react`                                      |
| State          | `useReducer` + React Context (none)                 |
| Persistence    | `localStorage` (settings, history)                  |

## Prerequisites

- Node.js **≥ 18.17** (Node 20+ recommended)
- npm 9+ (or pnpm / yarn — examples below use npm)

## Setup

```bash
# 1. install dependencies
npm install

# 2. start the dev server (HMR)
npm run dev          # → http://127.0.0.1:5173

# 3. production build (type-checks first, then Vite)
npm run build        # → dist/

# 4. preview the production build locally
npm run preview      # → http://127.0.0.1:4173
```

A new contributor should be on the Auditor page in under two minutes
from a clean clone.

## Scripts

| Script              | Purpose                                                                |
|---------------------|------------------------------------------------------------------------|
| `npm run dev`       | Start the Vite dev server with HMR.                                    |
| `npm run build`     | `tsc --noEmit` (twice, for app + node configs) → `vite build`.          |
| `npm run preview`   | Serve the production build locally.                                    |
| `npm run typecheck` | `tsc --noEmit` for the app + node configs. Used by CI.                 |

## Project structure

```
src/
  App.tsx                       # Route tree (BrowserRouter + Layout)
  main.tsx                      # React entry
  index.css                     # Tailwind directives + CSS custom properties
  components/
    layout/                     # Layout, Sidebar, Topbar (drawer + desktop rail)
    ui/                         # Drawer, PageHeader, StubPanel, ConfirmDialog
    editor/                     # CodeEditor (CodeMirror), EditorToolbar
    audit/                      # ScanButton, AgentProgress, RiskScoreGauge,
                                # VulnerabilityTable, SuggestionCard, GasTipsList
    dashboard/                  # StatCard, TrendChart
    history/                    # HistoryRow
  pages/                        # Dashboard, Auditor, History, Settings, NotFound
  hooks/
    useScan.ts                  # Multi-agent scan lifecycle + AbortController
    useScanHistory.ts           # localStorage-backed history (cap 100, FIFO)
    useSettings.ts              # localStorage-backed user preferences
    useUIState.ts               # Sidebar collapse override
    useMediaQuery.ts            # matchMedia wrapper
  lib/
    scanEngine.ts               # runScan(code, onProgress, signal, options) → Report
    reportTypes.ts              # All shared scan/report types (no `any`)
    agentConfig.ts              # The 4 named agents
    severity.ts                 # Severity colour + label helpers
  data/
    sampleContract.ts           # VulnerableVault.sol (placeholder, intentional flaws)
    vulnerabilityPatterns.ts    # 8-rule regex bank
```

### Architectural notes

- **Strict TypeScript everywhere.** `tsconfig.json` enables `strict`,
  `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`,
  `noUncheckedIndexedAccess`, and `noImplicitOverride`. The
  `npm run typecheck` script also runs against `tsconfig.node.json`
  (for `vite.config.ts` and `tailwind.config.ts`).
- **No `any` in the scan pipeline.** `src/lib/**` and the
  `useScan` / `useScanHistory` / `useSettings` hooks are `any`-free.
- **Determinism.** The scan engine hashes the source (FNV-1a) and
  seeds a small LCG, so the same contract always produces the same
  report. Useful for re-running scans during demos and tests.
- **Cancellation.** `useScan` owns an `AbortController`; the engine
  uses an `abortableSleep` that rejects on abort, and the UI's Cancel
  button surfaces the in-flight agents as `cancelled` instead of
  leaving them in `running` limbo.
- **Persistence shape.** Two `localStorage` keys:
  - `smart-auditor:settings` (Solidity version + sensitivity + theme)
  - `smart-auditor:history` (last 100 reports, FIFO)
  - `smart-auditor:ui` (sidebar collapse override)
  All reads are try/catch'd so private-mode browsers do not throw.
- **Responsive.** The sidebar is a persistent rail at `>= 1024px` and
  slides in from a hamburger drawer below. The risk-score gauge
  shrinks to 180 px on phones; the rest of the report cards stack
  vertically by default (`flex-col` → `sm:flex-row`).

### Simulated-scan caveat

The 4 agents do **not** call out to a real static-analysis engine.
`runScan` runs in-browser, sleeps for a jittered 500-900 ms per agent
(total 2.0-3.6 s), and produces a typed `Report` whose
`vulnerabilities` come from the regex bank. The "AI Security
Reviewer" name is a deliberate nod to the multi-agent LLM pattern but
the engine does not hit an LLM API in v1 — suggestions are templated
from each rule's `remediation` field. The output is real (matches
the source, severity-correct, banded) but should not be treated as
authoritative.

## Browser support

Tested on the latest two stable versions of Chrome, Firefox, and
Safari. Uses `matchMedia`, `localStorage`, `AbortController`,
`requestAnimationFrame`, and ES2022 syntax (no legacy transpilation).

## Known limitations

- **No real static analysis.** See the simulated-scan caveat above.
- **Single-page bundle is ~1.2 MB minified (~360 kB gzip).** The bulk
  is CodeMirror 6 and Recharts. Code-splitting the Auditor page
  (`React.lazy`) is tracked as a follow-up — for localhost the
  warning is not blocking.
- **Settings are per-browser.** No sync between devices; "Reset all
  data" clears the local browser only.
- **Vite 5 / esbuild dev-server audit warning.** Acknowledged and
  mitigated by binding the dev server to `127.0.0.1`; upgrading to
  Vite 8 is out of scope for v1.

## License

Internal project. Sample contract (`VulnerableVault.sol`) is
SPDX-licensed MIT; it is **deliberately vulnerable** for demo
purposes — do not deploy.
