import { useMemo } from 'react';
import CodeMirror, { type Extension } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, lineNumbers } from '@codemirror/view';
import { indentOnInput } from '@codemirror/language';

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  /** Read-only flag, useful when a scan is in flight (AC-5). */
  readOnly?: boolean;
  /** Optional aria-label override. */
  ariaLabel?: string;
}

/**
 * Monospaced, syntax-highlighted code editor used by the Auditor page.
 *
 * - CodeMirror 6 via `@uiw/react-codemirror` (no Monaco, no heavy diff
 *   engine).
 * - The JavaScript language pack gives reasonable Solidity highlighting
 *   (keywords, strings, numbers, comments) — there is no first-party
 *   CodeMirror Solidity grammar, and a third-party one would be a
 *   separate dependency we do not need for v1.
 * - The `oneDark` theme matches the rest of the app's dark palette.
 * - `lineNumbers()` shows the gutter.
 * - The wrapper fills the parent (`height: 100%`), and the inner
 *   `.cm-scroller` is set to `overflow: auto` so very long lines scroll
 *   horizontally inside the rail instead of wrapping — important for the
 *   360 px responsive pass in AC-10.
 */
function CodeEditor({
  value,
  onChange,
  readOnly = false,
  ariaLabel = 'Solidity source code',
}: CodeEditorProps): JSX.Element {
  // Stable extensions per mount. We rebuild on `readOnly` change only
  // because the readOnly flag is the only extension that depends on
  // runtime state; everything else is constant for the component's
  // lifetime.
  const extensions = useMemo<Extension[]>(() => {
    const exts: Extension[] = [
      lineNumbers(),
      EditorView.lineWrapping,
      indentOnInput(),
      javascript({ typescript: false }),
      oneDark,
      EditorView.theme(
        {
          '&': {
            height: '100%',
            backgroundColor: 'transparent',
            fontSize: '13px',
            fontFamily:
              '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: 'inherit',
          },
          '.cm-gutters': {
            backgroundColor: 'transparent',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(230,232,239,0.35)',
          },
          '.cm-activeLine': {
            backgroundColor: 'rgba(99, 102, 241, 0.06)',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'rgba(99, 102, 241, 0.10)',
            color: '#a78bfa',
          },
          '.cm-cursor': {
            borderLeftColor: '#a78bfa',
          },
          '.cm-selectionBackground, ::selection': {
            backgroundColor: 'rgba(99, 102, 241, 0.30) !important',
          },
        },
        { dark: true },
      ),
      EditorView.editable.of(!readOnly),
    ];
    return exts;
  }, [readOnly]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme="dark"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        foldGutter: false,
        autocompletion: false,
        bracketMatching: true,
        closeBrackets: true,
        indentOnInput: true,
        tabSize: 4,
      }}
      editable={!readOnly}
      readOnly={readOnly}
      aria-label={ariaLabel}
      className="h-full"
    />
  );
}

export default CodeEditor;
