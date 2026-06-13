import { Settings as SettingsIcon } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StubPanel from '../components/ui/StubPanel';

function Settings(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Configure the default Solidity version, risk-score sensitivity, and reset all local data. The full settings surface lands in AC-9."
      />
      <StubPanel
        Icon={SettingsIcon}
        title="Preferences + reset"
        description="Settings will be persisted to localStorage (key: smart-auditor:settings). The dark theme is locked for v1, with a 'Light — coming soon' toggle disabled. A 'Reset all data' button is gated by a confirmation modal."
        ac="AC-9"
        bullets={[
          'Default Solidity version (0.8.20 / 0.8.24 / 0.8.26)',
          'Risk-score sensitivity (Low / Medium / High)',
          'Theme: dark only (light toggle disabled)',
          'Reset all data (with confirmation modal)',
        ]}
      />
    </div>
  );
}

export default Settings;
