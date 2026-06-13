import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { riskBandFor } from '../../lib/severity';

interface RiskScoreGaugeProps {
  /** 0-100. Values outside the range are clamped at render time. */
  score: number;
  /** Optional caption shown beneath the number (e.g. "Critical"). */
  label?: string;
  /** Diameter in pixels. */
  size?: number;
}

/**
 * Circular risk-score gauge built on Recharts' `RadialBar`.
 *
 * The score is clamped to [0, 100], colour-coded by band (red ≥ 70,
 * amber 40-69, green < 40 — per the plan verification matrix), and
 * rendered at a configurable diameter so the same component drives
 * both the main report and the 360 px responsive pass (AC-10).
 */
function RiskScoreGauge({
  score,
  label,
  size = 220,
}: RiskScoreGaugeProps): JSX.Element {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band = riskBandFor(clamped);
  const data = [{ name: 'risk', value: clamped, fill: band.hex }];

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score: ${clamped} out of 100 (${label ?? band.label})`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="78%"
          outerRadius="100%"
          data={data}
          startAngle={210}
          endAngle={-30}
          barSize={12}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: 'rgba(255,255,255,0.06)' }}
            dataKey="value"
            cornerRadius={6}
            isAnimationActive={true}
            animationDuration={600}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`font-mono text-4xl font-semibold ${band.textClass}`}>
          {clamped}
        </p>
        <p className="font-mono text-[11px] text-text-muted">/ 100</p>
        <p className={`mt-1 text-[11px] font-medium uppercase tracking-widest ${band.textClass}`}>
          {label ?? band.label}
        </p>
      </div>
    </div>
  );
}

export default RiskScoreGauge;
