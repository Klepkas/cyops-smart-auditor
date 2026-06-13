import { ShieldCheck } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StubPanel from '../components/ui/StubPanel';

function Auditor(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Scan"
        title="Auditor"
        description="Paste your Solidity contract, run a multi-agent vulnerability scan, and inspect the report. The editor and scan controls land in AC-4 / AC-5."
      />
      <StubPanel
        Icon={ShieldCheck}
        title="Editor + multi-agent scan engine"
        description="This view will host the CodeMirror Solidity editor, the 'Scan for Vulnerabilities' primary action, the 4-agent loading sequence (Static Analyzer → Symbolic Executor → AI Security Reviewer → Gas Optimizer), and the full audit report (Risk Score, Vulnerabilities, Suggestions, Gas Tips)."
        ac="AC-4 → AC-6"
        bullets={[
          'CodeMirror 6 with Solidity syntax + line numbers',
          '4-agent cancellable loading sequence',
          'Risk Score gauge + vulnerabilities table',
          'Detailed remediation suggestions + gas tips',
        ]}
      />
    </div>
  );
}

export default Auditor;
