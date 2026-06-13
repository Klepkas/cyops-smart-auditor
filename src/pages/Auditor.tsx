import { useCallback, useMemo, useState } from 'react';
import { RotateCcw, Eraser } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import ScanButton from '../components/editor/ScanButton';
import { SAMPLE_CONTRACT, SAMPLE_CONTRACT_NAME } from '../data/sampleContract';

/**
 * Auditor page — large Solidity editor with a "Scan for Vulnerabilities"
 * primary action.
 *
 * AC-4 scope:
 *   - Render the CodeMirror editor with line numbers, syntax highlighting,
 *     dark theme.
 *   - Preload the demo `VulnerableVault.sol` contract so the page is
 *     useful on first load.
 *   - Surface a primary "Scan for Vulnerabilities" button.
 *
 * The actual scan engine + cancellable progress UI land in AC-5. For now
 * the button logs a friendly "coming soon" message via `alert` and we
 * expose `isLoading` plumbing so AC-5 can hook in without re-plumbing.
 */
function Auditor(): JSX.Element {
  const [code, setCode] = useState<string>(SAMPLE_CONTRACT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCodeChange = useCallback((next: string) => {
    setCode(next);
  }, []);

  const handleReset = useCallback(() => {
    setCode(SAMPLE_CONTRACT);
  }, []);

  const handleClear = useCallback(() => {
    setCode('');
  }, []);

  // AC-5 will replace this with the multi-agent scan engine. For now we
  // surface a clear "coming soon" message so the button is visibly wired
  // and the disabled-while-loading state can be observed.
  const handleScan = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    // Simulate a brief loading state so reviewers can see the disabled /
    // spinner transitions without needing the AC-5 engine in place.
    window.setTimeout(() => {
      setIsLoading(false);
      window.alert(
        'Scan engine lands in AC-5. The code is loaded — try the Reset / Clear buttons to confirm the editor is fully interactive.',
      );
    }, 600);
  }, [isLoading]);

  const lineCount = useMemo(
    () => (code.length === 0 ? 0 : code.split('\n').length),
    [code],
  );
  const charCount = code.length;

  const toolbarActions = (
    <>
      <button
        type="button"
        onClick={handleReset}
        disabled={isLoading}
        title="Restore the placeholder VulnerableVault.sol"
        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Reset</span>
      </button>
      <button
        type="button"
        onClick={handleClear}
        disabled={isLoading}
        title="Clear the editor"
        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Eraser aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Clear</span>
      </button>
    </>
  );

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
      <PageHeader
        eyebrow="Scan"
        title="Auditor"
        description="Paste a Solidity contract, then run a multi-agent vulnerability scan. The scan engine lights up in AC-5."
      />

      <section
        aria-label="Code editor"
        className="flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel shadow-panel"
      >
        <EditorToolbar
          filename={SAMPLE_CONTRACT_NAME}
          lineCount={lineCount}
          charCount={charCount}
          actions={toolbarActions}
        />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            readOnly={isLoading}
            ariaLabel="Solidity source code editor"
          />
        </div>
      </section>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-text-muted">
          The scan runs locally in your browser. No code is sent to a server.
        </p>
        <ScanButton
          onClick={handleScan}
          isLoading={isLoading}
          disabled={code.trim().length === 0}
        />
      </div>
    </div>
  );
}

export default Auditor;
