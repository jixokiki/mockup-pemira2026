'use client';
import { useEffect, useMemo, useRef } from 'react';
import anime from 'animejs';
import { Crown } from 'lucide-react';
import { Bar, CountUp } from './ui';
import { Row } from '@/lib/selectors';
import { fmtNum } from '@/lib/utils';

export function ResultsPanel({ rows, total }: { rows: Row[]; total: number }) {
  const sorted = [...rows].sort((a, b) => b.votes - a.votes);
  if (!rows.length) return <p className="py-8 text-center text-sm text-zinc-400">Belum ada kandidat terdaftar.</p>;
  return (
    <div className="space-y-6">
      {sorted.map((r, i) => (
        <div key={r.candidate.id}>
          <div className="mb-2 flex items-end justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
              <span className="truncate text-sm font-medium">{r.candidate.ketua.nama} &amp; {r.candidate.wakil.nama}</span>
              {i === 0 && total > 0 && <Crown size={14} className="shrink-0 text-amber-500" />}
            </div>
            <div className="text-right">
              <CountUp value={r.pct} decimals={1} suffix="%" className="text-xl font-semibold" />
              <p className="text-[11px] text-zinc-400"><CountUp value={r.votes} /> suara</p>
            </div>
          </div>
          <Bar pct={r.pct} color={r.color} />
        </div>
      ))}
      <p className="border-t border-zinc-100 pt-3 text-[11px] text-zinc-400">
        Total suara masuk: <b className="text-zinc-600">{fmtNum(total)}</b> · Persentase = suara kandidat ÷ total suara masuk × 100
      </p>
    </div>
  );
}

/** Tren suara kumulatif 24 jam terakhir, digambar dengan anime.js */
export function TrendChart({ votes }: { votes: { at: string }[] }) {
  const line = useRef<SVGPathElement>(null);
  const area = useRef<SVGPathElement>(null);
  const W = 640, H = 210, P = { l: 36, r: 12, t: 12, b: 26 }, B = 8;

  const { d, a, pts, max } = useMemo(() => {
    const now = Date.now(), span = 24 * 3600e3, step = span / B;
    const times = votes.map((v) => new Date(v.at).getTime());
    const pts = Array.from({ length: B + 1 }, (_, i) => {
      const t = now - span + step * i;
      return { t, c: times.filter((x) => x <= t).length };
    });
    const max = Math.max(4, ...pts.map((p) => p.c));
    const x = (i: number) => P.l + (i / B) * (W - P.l - P.r);
    const y = (c: number) => P.t + (1 - c / max) * (H - P.t - P.b);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.c).toFixed(1)}`).join(' ');
    const a = `${d} L${x(B)},${H - P.b} L${x(0)},${H - P.b} Z`;
    return { d, a, pts: pts.map((p, i) => ({ ...p, x: x(i), y: y(p.c) })), max };
  }, [votes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!line.current || !area.current) return;
    anime({ targets: line.current, strokeDashoffset: [anime.setDashoffset, 0], duration: 1300, easing: 'easeOutQuart' });
    anime({ targets: area.current, opacity: [0, 1], duration: 900, delay: 300, easing: 'easeOutQuad' });
    anime({ targets: '.tp', scale: [0, 1], opacity: [0, 1], delay: anime.stagger(70, { start: 500 }), duration: 400, easing: 'easeOutBack' });
  }, [d]);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Tren suara masuk 24 jam terakhir">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a5cff" stopOpacity=".22" />
            <stop offset="100%" stopColor="#1a5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => {
          const yy = P.t + (1 - g) * (H - P.t - P.b);
          return (
            <g key={g}>
              <line x1={P.l} x2={W - P.r} y1={yy} y2={yy} stroke="#e4e4e7" strokeDasharray="3 4" />
              <text x={P.l - 8} y={yy + 3} textAnchor="end" fontSize="10" fill="#a1a1aa">{Math.round(max * g)}</text>
            </g>
          );
        })}
        <path ref={area} d={a} fill="url(#tg)" />
        <path ref={line} d={d} fill="none" stroke="#1a5cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle className="tp" cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#1a5cff" strokeWidth="2" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
            {i % 2 === 0 && (
              <text x={p.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#a1a1aa">
                {new Date(p.t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className="mt-1 text-[11px] text-zinc-400">Akumulasi suara masuk, 24 jam terakhir.</p>
    </div>
  );
}

export function DetailTable({ rows, total }: { rows: Row[]; total: number }) {
  const sorted = [...rows].sort((a, b) => b.votes - a.votes);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs text-zinc-500">
            <th className="py-2 pr-3 font-medium">#</th><th className="py-2 pr-3 font-medium">Paslon</th>
            <th className="py-2 pr-3 text-right font-medium">Suara</th><th className="py-2 text-right font-medium">Persentase</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.candidate.id} className="border-b border-zinc-100 last:border-0">
              <td className="py-2.5 pr-3 text-zinc-400">{i + 1}</td>
              <td className="py-2.5 pr-3 font-medium"><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: r.color }} />{r.candidate.ketua.nama} &amp; {r.candidate.wakil.nama}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums">{fmtNum(r.votes)}</td>
              <td className="py-2.5 text-right tabular-nums font-medium">{r.pct.toFixed(1)}%</td>
            </tr>
          ))}
          <tr><td /><td className="pt-3 text-xs text-zinc-400">Total</td><td className="pt-3 text-right text-xs font-medium tabular-nums">{fmtNum(total)}</td><td /></tr>
        </tbody>
      </table>
    </div>
  );
}
