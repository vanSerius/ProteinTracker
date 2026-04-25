import { shortDate, shortDay } from '../lib/date';

type Props = {
  dates: string[];
  values: number[];
  goal: number;
};

export default function BarChart({ dates, values, goal }: Props) {
  const maxVal = Math.max(goal * 1.2, ...values, 1);
  const width = 320;
  const height = 200;
  const pad = { l: 28, r: 8, t: 12, b: 28 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const barW = innerW / dates.length;
  const goalY = pad.t + innerH * (1 - goal / maxVal);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />

      <line x1={pad.l} y1={goalY} x2={pad.l + innerW} y2={goalY} className="stroke-brand-500" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={pad.l + innerW - 2} y={goalY - 3} textAnchor="end" className="fill-brand-500 text-[10px] font-semibold">
        goal {goal} g
      </text>

      {dates.map((d, i) => {
        const v = values[i] ?? 0;
        const h = innerH * Math.min(v / maxVal, 1);
        const x = pad.l + i * barW + 2;
        const y = pad.t + innerH - h;
        const w = Math.max(2, barW - 4);
        const hit = v >= goal;
        return (
          <g key={d}>
            <rect
              x={x}
              y={y}
              width={w}
              height={Math.max(h, 1)}
              rx={2}
              className={hit ? 'fill-emerald-500' : v > 0 ? 'fill-amber-400' : 'fill-slate-300 dark:fill-slate-700'}
            />
            <text
              x={x + w / 2}
              y={pad.t + innerH + 14}
              textAnchor="middle"
              className="fill-slate-500 dark:fill-slate-400 text-[9px]"
            >
              {dates.length <= 7 ? shortDay(d) : i % 5 === 0 ? shortDate(d) : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
