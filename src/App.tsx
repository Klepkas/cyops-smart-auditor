/**
 * Bootstrap shell for the Smart Contract Auditor.
 *
 * AC-2 verifies that the dark design system is wired up. This component
 * exercises the colour tokens, typography, and the `@tailwindcss/forms`
 * plugin so a visual reviewer can confirm everything renders without a
 * Flash Of Unstyled Content. The richer `Layout` + `Sidebar` shells land
 * in AC-3.
 */
function App(): JSX.Element {
  return (
    <main className="min-h-screen bg-surface text-text-primary antialiased">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2.5 4 6v6c0 4.5 3.2 8.6 8 9.5 4.8-.9 8-5 8-9.5V6l-8-3.5Z" />
                <path d="m9 12 2.2 2.2L15 9" />
              </svg>
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-text-muted">
                Smart Contract Auditor
              </p>
              <h1 className="text-display-md text-text-primary">
                Design system preview
              </h1>
            </div>
          </div>
          <button
            type="button"
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-panel transition hover:bg-brand-600"
          >
            New scan
            <span aria-hidden="true">→</span>
          </button>
        </header>

        <section className="rounded-2xl border border-border-subtle bg-surface-panel p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-text-primary">Color tokens</h2>
          <p className="mt-1 text-sm text-text-muted">
            Every component should reach for these tokens, never raw hex.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ['bg-surface', 'Page'],
                ['bg-surface-panel', 'Panel'],
                ['bg-surface-elevated', 'Elevated'],
                ['bg-surface-muted', 'Muted'],
                ['bg-brand-500', 'Brand'],
                ['bg-risk-critical', 'Critical'],
                ['bg-risk-medium', 'Medium'],
                ['bg-risk-low', 'Low'],
              ] as const
            ).map(([cls, label]) => (
              <div
                key={cls}
                className="rounded-xl border border-border-subtle bg-surface-elevated p-3"
              >
                <div className={`${cls} h-10 w-full rounded-md ring-1 ring-white/5`} />
                <p className="mt-2 text-xs font-medium text-text-secondary">{label}</p>
                <p className="font-mono text-[11px] text-text-subtle">{cls}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-surface-panel p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-text-primary">Typography</h2>
          <p className="mt-1 text-sm text-text-muted">
            Inter for UI, JetBrains Mono for code.
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-display-lg text-text-primary">Display large</p>
            <p className="text-display-md text-text-primary">Display medium</p>
            <p className="text-base text-text-primary">Body — primary text</p>
            <p className="text-sm text-text-secondary">Body — secondary text</p>
            <p className="text-xs text-text-muted">Caption — muted helper</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-border-subtle bg-surface-muted p-3 font-mono text-sm text-text-primary">
{`pragma solidity ^0.8.20;
contract Vault {
    mapping(address => uint256) public balances;
}`}
            </pre>
          </div>
        </section>

        <section className="rounded-2xl border border-border-subtle bg-surface-panel p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-text-primary">Forms (Tailwind forms plugin)</h2>
          <p className="mt-1 text-sm text-text-muted">
            Form controls should use the project tokens, not the OS defaults.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                Contract name
              </span>
              <input
                type="text"
                defaultValue="Vault.sol"
                className="focus-ring mt-1 w-full rounded-lg border-border-subtle bg-surface-muted text-sm text-text-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-secondary">
                Solidity version
              </span>
              <select
                defaultValue="0.8.24"
                className="focus-ring mt-1 w-full rounded-lg border-border-subtle bg-surface-muted text-sm text-text-primary"
              >
                <option>0.8.20</option>
                <option>0.8.24</option>
                <option>0.8.26</option>
              </select>
            </label>
          </div>
        </section>

        <footer className="text-xs text-text-subtle">
          AC-2 design system preview · Tailwind 3.4 · @tailwindcss/forms
        </footer>
      </div>
    </main>
  );
}

export default App;
