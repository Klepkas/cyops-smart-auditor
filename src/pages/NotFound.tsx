import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

function NotFound(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
      >
        <Compass className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
          Error 404
        </p>
        <h2 className="mt-1 text-display-md text-text-primary">Page not found</h2>
        <p className="mt-2 text-sm text-text-muted">
          The route you tried to open is not part of the Smart Contract Auditor.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-panel transition hover:bg-brand-600"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
