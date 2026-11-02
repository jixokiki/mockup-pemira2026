'use client';
import { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, UserRound, Users } from 'lucide-react';
import { useEnter } from '@/lib/anim';
import { eligibleFor, useStore } from '@/lib/store';
import { tally } from '@/lib/selectors';
import { JURUSAN, KAMPUS, Jurusan, Kampus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CountUp, LiveDot, Tabs } from '@/components/ui';
import { DetailTable, ResultsPanel, TrendChart } from '@/components/Results';

export default function Page() {
  const candidates = useStore((s) => s.candidates);
  const votes = useStore((s) => s.votes);
  const [kampus, setKampus] = useState<Kampus>(KAMPUS[0]);
  const [jurusan, setJurusan] = useState<Jurusan>(JURUSAN[0]);
  const [tab, setTab] = useState<'trend' | 'detail'>('trend');
  const ref = useEnter<HTMLDivElement>();

  const { rows, total } = useMemo(() => tally(candidates, votes, kampus, jurusan), [candidates, votes, kampus, jurusan]);
  const eligible = eligibleFor(kampus, jurusan);
  const scoped = useMemo(() => votes.filter((v) => v.kampus === kampus && v.jurusan === jurusan), [votes, kampus, jurusan]);

  // ringkasan 3 kampus untuk jurusan terpilih
  const perKampus = useMemo(() => KAMPUS.map((k) => {
    const t = tally(candidates, votes, k, jurusan);
    const lead = [...t.rows].sort((a, b) => b.votes - a.votes)[0];
    return { k, total: t.total, eligible: eligibleFor(k, jurusan), lead: t.total > 0 ? lead : undefined };
  }), [candidates, votes, jurusan]);

  const stats = [
    { l: 'Total Pemilih', i: UserRound, v: <CountUp value={eligible} /> },
    { l: 'Sudah Memilih', i: CheckCircle2, v: <CountUp value={total} /> },
    { l: 'Partisipasi', i: BarChart3, v: <CountUp value={eligible ? (total / eligible) * 100 : 0} decimals={1} suffix=" %" /> },
    { l: 'Kandidat', i: Users, v: <><CountUp value={rows.length} /> Paslon</> },
  ];

  return (
    <div ref={ref} className="space-y-5">
      <section data-anim className="card flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Quick Count Real-Time </h1>
          <p className="mt-0.5 text-sm text-zinc-500">Statistik suara masuk. Berubah seketika saat mahasiswa melakukan vote.</p>
        </div>
        <div className="w-full sm:w-64">
          <label className="label">Jurusan</label>
          <select className="input" value={jurusan} onChange={(e) => setJurusan(e.target.value as Jurusan)}>{JURUSAN.map((j) => <option key={j}>{j}</option>)}</select>
        </div>
      </section>

      <section data-anim className="grid gap-3 sm:grid-cols-3">
        {perKampus.map((p) => (
          <button key={p.k} onClick={() => setKampus(p.k)}
            className={cn('card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md', kampus === p.k && 'border-blue-500 ring-4 ring-blue-500/10')}>
            <div className="flex items-center justify-between"><p className="text-xs font-medium text-zinc-500">Kampus {p.k}</p>{kampus === p.k && <span className="badge-blue">Dipilih</span>}</div>
            <p className="mt-2 text-2xl font-semibold"><CountUp value={p.total} /> <span className="text-xs font-normal text-zinc-400">suara</span></p>
            <p className="mt-1 truncate text-xs text-zinc-500">{p.lead ? `Unggul: ${p.lead.candidate.ketua.nama} & ${p.lead.candidate.wakil.nama}` : 'Belum ada suara'}</p>
            <p className="text-[11px] text-zinc-400">Partisipasi {p.eligible ? ((p.total / p.eligible) * 100).toFixed(1) : 0}%</p>
          </button>
        ))}
      </section>

      <section data-anim className="card flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <p className="text-sm"><span className="text-zinc-500">Detail:</span> <b>BEM {jurusan}</b> · Kampus {kampus}</p>
        <span className="badge-green">
          {/* <LiveDot />  */}
          Berlangsung
          </span>
      </section>

      <section data-anim className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ l, i: Icon, v }) => (
          <div key={l} className="card p-4"><p className="text-xs text-zinc-500">{l}</p><p className="mt-2 flex items-center gap-2 text-xl font-semibold"><Icon size={18} className="text-zinc-500" />{v}</p></div>
        ))}
      </section>

      <section data-anim className="card"><div className="border-b border-zinc-100 px-5 py-4"><h2 className="text-sm font-semibold">Hasil Real-Time</h2></div><div className="p-5"><ResultsPanel rows={rows} total={total} /></div></section>

      <section data-anim className="card p-5">
        <Tabs tabs={[{ id: 'trend', label: 'Tren Partisipasi' }, { id: 'detail', label: 'Data Detail' }]} value={tab} onChange={setTab} />
        <div className="pt-5">{tab === 'trend' ? <TrendChart key={`${kampus}${jurusan}`} votes={scoped} /> : <DetailTable rows={rows} total={total} />}</div>
      </section>
    </div>
  );
}
