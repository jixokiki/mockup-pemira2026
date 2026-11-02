'use client';
import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Users, UserRound } from 'lucide-react';
import { useEnter } from '@/lib/anim';
import { useMyElection } from '@/lib/hooks';
import { CountUp, LiveDot, Tabs } from '@/components/ui';
import { DetailTable, ResultsPanel, TrendChart } from '@/components/Results';

export default function Page() {
  const e = useMyElection();
  const ref = useEnter<HTMLDivElement>();
  const [tab, setTab] = useState<'trend' | 'detail'>('trend');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => setNow(new Date()), [e.total]);

  const stats = [
    { l: 'Total Pemilih', i: UserRound, v: <CountUp value={e.eligible} /> },
    { l: 'Sudah Memilih', i: CheckCircle2, v: <CountUp value={e.total} /> },
    { l: 'Partisipasi', i: BarChart3, v: <CountUp value={e.participation} decimals={1} suffix=" %" /> },
    { l: 'Kandidat', i: Users, v: <><CountUp value={e.rows.length} /> Paslon</> },
  ];

  return (
    <div ref={ref} className="space-y-5">
      <section data-anim className="card p-5">
        <h1 className="text-lg font-semibold tracking-tight">Quick Count Real-Time </h1>
        <p className="mt-0.5 text-sm text-zinc-500">Pantau hasil pemilihan secara langsung</p>
      </section>

      <section data-anim className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex items-center gap-2 text-sm"><span className="text-zinc-500">Pemilihan:</span><span className="rounded-lg border border-zinc-200 px-2.5 py-1 font-medium">BEM {e.j}</span><span className="text-xs text-zinc-400">{e.k}</span></div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>Update: {now.toLocaleTimeString('id-ID')}</span>
          <span className="badge-green">
            {/* <LiveDot /> */}
             Berlangsung</span>
        </div>
      </section>

      <section data-anim className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ l, i: Icon, v }) => (
          <div key={l} className="card p-4"><p className="text-xs text-zinc-500">{l}</p><p className="mt-2 flex items-center gap-2 text-xl font-semibold"><Icon size={18} className="text-zinc-500" />{v}</p></div>
        ))}
      </section>

      <section data-anim className="card"><div className="border-b border-zinc-100 px-5 py-4"><h2 className="text-sm font-semibold">Hasil Real-Time</h2></div><div className="p-5"><ResultsPanel rows={e.rows} total={e.total} /></div></section>

      <section data-anim className="card p-5">
        <Tabs tabs={[{ id: 'trend', label: 'Tren Partisipasi' }, { id: 'detail', label: 'Data Detail' }]} value={tab} onChange={setTab} />
        <div className="pt-5">{tab === 'trend' ? <TrendChart key="t" votes={e.votes} /> : <DetailTable rows={e.rows} total={e.total} />}</div>
      </section>
    </div>
  );
}
