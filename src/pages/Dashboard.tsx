import { LayoutDashboard } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StubPanel from '../components/ui/StubPanel';

function Dashboard(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Aggregate metrics from your scan history. The empty state, stat cards, and trend sparkline land in AC-7."
      />
      <StubPanel
        Icon={LayoutDashboard}
        title="Scan history drives this view"
        description="Once you finish your first scan, the dashboard will populate total scans, average risk, severity counts, and a trend sparkline of the last 10 scans. Right now the design shell is the focus — routing and layout are live."
        ac="AC-7"
        bullets={[
          'Empty-state CTA when no scans exist',
          'Stat cards for total / avg / severity counts',
          'Trend sparkline of the last 10 scans',
          'Memoised derivation so editor keystrokes do not re-render',
        ]}
      />
    </div>
  );
}

export default Dashboard;
