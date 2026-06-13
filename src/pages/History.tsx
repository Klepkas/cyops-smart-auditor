import { History as HistoryIcon } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StubPanel from '../components/ui/StubPanel';

function History(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Library"
        title="Scan History"
        description="Search, sort, reopen, and delete past audit reports. The list view, search, and localStorage persistence land in AC-8."
      />
      <StubPanel
        Icon={HistoryIcon}
        title="Persisted scan list"
        description="Scans are stored in localStorage (key: smart-auditor:history) and capped at 100 entries. The view will support search by code substring, sort by date or risk, row-click to reopen, row-delete, and 'Clear all'."
        ac="AC-8"
        bullets={[
          'Search by code substring (case-insensitive)',
          'Sort by date or risk score',
          'Row click → reopen the report',
          'Delete a single row or clear all',
        ]}
      />
    </div>
  );
}

export default History;
