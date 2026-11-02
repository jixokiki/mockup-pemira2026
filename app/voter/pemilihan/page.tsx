'use client';
import { useState } from 'react';
import { CheckCircle2, Clock, Trophy, Users, Vote } from 'lucide-react';
import { useEnter } from '@/lib/anim';
import { useMyElection } from '@/lib/hooks';
import { fmtDate } from '@/lib/utils';
import { Candidate } from '@/lib/types';
import CandidateCard from '@/components/CandidateCard';
import VoteDialog from '@/components/VoteDialog';

export default function Page() {
  const e = useMyElection();
  const ref = useEnter<HTMLDivElement>([e.rows.length]);
  const [target, setTarget] = useState<Candidate | null>(null);

  return (
    <div ref={ref} className="space-y-5">
      <section data-anim className="card flex items-center justify-between gap-4 p-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Pemilihan Raya 2026 </h1>
          <p className="mt-0.5 text-sm text-zinc-500">Berpartisipasilah dalam pemilihan untuk menentukan pemimpin organisasi</p>
        </div>
        <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 sm:grid"><Trophy size={20} /></span>
      </section>

      <section data-anim className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{e.name}</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Pemilihan Badan Eksekutif Mahasiswa jurusan {e.j} kampus {e.k}, periode 2026–2027</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-500">
              <span className={e.open ? 'badge-green' : 'badge-zinc'}>{e.open ? 'Berlangsung' : 'Ditutup'}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Berakhir: {fmtDate(e.endsAt)}</span>
              <span className="flex items-center gap-1"><Users size={12} /> {e.rows.length} kandidat</span>
            </div>
          </div>
          {e.voted && (
            <div className="text-right">
              <span className="badge-green"><CheckCircle2 size={11} /> Sudah Memilih</span>
              <p className="mt-1 text-[11px] text-zinc-500">Pilihan: {e.rows.find((r) => r.candidate.id === e.myVote?.candidateId)?.candidate.ketua.nama} &amp; {e.rows.find((r) => r.candidate.id === e.myVote?.candidateId)?.candidate.wakil.nama}</p>
            </div>
          )}
        </div>

        {e.rows.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-12 text-center">
            <Vote size={26} className="mx-auto text-zinc-300" />
            <p className="mt-2 text-sm font-medium text-zinc-600">Belum ada paslon</p>
            <p className="text-xs text-zinc-400">Admin belum menginput kandidat untuk jurusan {e.j}.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {e.rows.map((r) => {
              const mine = e.myVote?.candidateId === r.candidate.id;
              return (
                <CandidateCard key={r.candidate.id} c={r.candidate} color={r.color} selected={mine} dim={e.voted && !mine}
                  votes={e.voted ? r.votes : undefined}
                  footer={
                    mine ? <button className="btn h-10 w-full bg-emerald-50 text-emerald-700" disabled><CheckCircle2 size={15} /> Telah Dipilih</button>
                    : e.voted || !e.open ? <button className="btn h-10 w-full bg-zinc-100 text-zinc-400" disabled>Selesai</button>
                    : <button className="btn-primary h-10 w-full" onClick={() => setTarget(r.candidate)}><Vote size={15} /> Pilih Kandidat</button>
                  } />
              );
            })}
          </div>
        )}
      </section>

      {target && <VoteDialog candidate={target} onClose={() => setTarget(null)} />}
    </div>
  );
}
