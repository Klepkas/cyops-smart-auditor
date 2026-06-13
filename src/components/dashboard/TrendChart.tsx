import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Report } from '../../lib/reportTypes';

interface TrendChartProps {
  /** Newest-last order — the chart re-sorts internally. */
  history: readonly Report[];
  /** Max points to plot (default 10, per the AC-7 spec). */
  maxPoints?: number;
}

interface TrendPoint {
  readonly index: number;
  readonly riskScore: number;
  readonly label: string;
}

/**
 * Sparkline-style line chart of risk score over the last N scans.
 * Newest is on the right; hover shows the full timestamp.
 */
function TrendChart({ history, maxPoints = 10 }: TrendChartProps): JSX.Element {
  const data = useMemo<readonly TrendPoint[]>(() => {
    const recent = history.slice(0, maxPoints).slice().reverse();
    return recent.map((report, index) => {
      const ts = new Date(report.createdAt);
      const label = ts.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
      return { index, riskScore: report.riskScore, label };
    });
  }, [history, maxPoints]);

  if (data.length === 0) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-4 text-sm text-text-muted">
        No trend yet — run your first scan to see the sparkline populate.
      </p>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.slice()} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="index"
            tick={{ fill: 'rgba(154,163,178,0.7)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(154,163,178,0.7)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(99,102,241,0.4)', strokeWidth: 1 }}
            contentStyle={{
              background: '#11141b',
              border: '1px solid #2a3142',
              borderRadius: 8,
              fontSize: 12,
              color: '#e6e8ef',
            }}
            labelFormatter={() => ''}
            formatter={(value, _name, props) => {
              const point = (props as { payload?: TrendPoint })?.payload;
              const numeric = typeof value === 'number' ? value : Number(value);
              return [`${numeric}/100 · ${point?.label ?? ''}`, 'Risk score'];
            }}
          />
          <Line
            type="monotone"
            dataKey="riskScore"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ r: 3, fill: '#a78bfa' }}
            activeDot={{ r: 5, fill: '#6366f1' }}
            isAnimationActive={true}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
