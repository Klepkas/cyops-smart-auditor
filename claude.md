# Smart Contract Auditor — Project Standards

This file defines the standards, conventions, and operating expectations for
**all** AI agents (Claude, Codex, Cursor, etc.) and human contributors working
on the `cyops-smartauditor` project. Adhere to these rules unless an active
plan or reviewer explicitly overrules them.

## Project at a glance

- **Purpose**: A polished, dark-themed, single-page web app that lets users
  paste Solidity code, run a *simulated* multi-agent vulnerability scan, and
  inspect a styled audit report (Risk Score, vulnerabilities, remediation
  suggestions, gas tips).
- **Stack** (locked): Vite 5, React 18, TypeScript 5, Tailwind CSS 3.4,
  React Router v6, CodeMirror 6 (`@uiw/react-codemirror`), Recharts,
  `lucide-react`.
- **No backend, no real static-analysis engine.** All "scans" are
  deterministic client-side simulations seeded by a hash of the code.

## Repository layout

```
.
├── docs/                      # design notes, plans
├── index.html                 # Vite entry HTML
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css              # Tailwind directives + custom CSS vars
│   ├── components/
│   │   ├── layout/            # Layout, Sidebar, Topbar
│   │   ├── ui/                # Button, Card, Drawer, Modal, Badge, ConfirmDialog
│   │   ├── editor/            # CodeEditor
│   │   ├── audit/             # RiskScoreGauge, VulnerabilityTable, SuggestionCard, GasTipsList, AgentProgress, ScanButton
│   │   ├── dashboard/         # StatCard, TrendChart
│   │   └── history/           # HistoryRow
│   ├── pages/                 # Dashboard, Auditor, History, Settings
│   ├── hooks/                 # useScan, useScanHistory, useSettings
│   ├── lib/                   # scanEngine, reportTypes, severity, storage
│   └── data/                  # sampleContract, vulnerabilityPatterns
└── README.md
```

## Required scripts

| Script              | Purpose                                       |
|---------------------|-----------------------------------------------|
| `npm run dev`       | Vite dev server on `http://localhost:5173`.   |
| `npm run build`     | Type-check + production build to `dist/`.     |
| `npm run preview`   | Preview the production build.                 |
| `npm run typecheck` | `tsc --noEmit` — strict type-check only.      |
| `npm run lint`      | ESLint with the project config (if present).  |

## Coding conventions

- **TypeScript strictness**: `"strict": true`, `noUncheckedIndexedAccess: true`.
  Do **not** introduce `any` in the scan/report pipeline (see AC-11).
- **Styling**: Tailwind utility classes only. No CSS-in-JS, no inline
  `style={…}` props except for the radial gauge's `strokeDasharray`.
- **Color tokens**: use the project palette (`bg-surface`, `bg-panel`,
  `bg-elevated`, `text-primary`, `text-muted`, `text-brand`, `text-risk-*`).
  Never hard-code hex values in components.
- **Focus rings**: every interactive element must use
  `focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:outline-none`.
- **Imports**: absolute imports via Vite's default resolution; group by
  `react`, third-party, local; alphabetise within each group.
- **State**: prefer `useState` + custom hooks (`useScan`, `useScanHistory`,
  `useSettings`) over a global store for v1.
- **Persistence**: `localStorage` only. Keys:
  - `smart-auditor:history`
  - `smart-auditor:settings`

## Testing & verification

- This iteration does **not** include a unit/E2E harness. Verification is
  manual via the matrix in `docs/plans/plan.md` (or `.humanize/rlcr/.../plan.md`).
- Before declaring an AC done, run the narrowest meaningful check
  (build, type-check, or quick browser smoke test).
- Do not run long, exhaustive test suites — the Reviewer role will do deeper
  validation downstream.

## Plan tracking

- Active plan and AC list: `.humanize/rlcr/<session>/plan.md` and
  `.humanize/rlcr/<session>/goal-tracker.md`.
- Update the goal-tracker at the end of each round: mark the active task's
  status, append a `Plan Evolution Log` entry if scope shifts.

## Process safety

- Never run broad process-kill commands (`pkill`, `killall`, `kill -9 -1`).
  The harness runs shared system services on ports 47291 / 47292 / 23000 that
  must stay alive.
- Use targeted PID or port-based termination for any background test servers
  you start.

## Out of scope (v1)

- Real Slither/Mythril integration.
- Auth, multi-user, cloud sync, backend API.
- Light theme, i18n, full a11y audit.
- PDF/JSON report export.
- Web3 wallet, on-chain verification, RPC calls.
- CI/CD, Docker, deploy scripts.
