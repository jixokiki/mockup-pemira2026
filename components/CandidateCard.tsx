'use client';
import { Avatar, Collapsible, CountUp } from './ui';
import { Candidate } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function CandidateCard({
  c, color, footer, votes, selected, dim,
}: { c: Candidate; color: string; footer?: React.ReactNode; votes?: number; selected?: boolean; dim?: boolean }) {
  const misi = c.misi.split('\n').map((m) => m.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  return (
    <article className={cn(
      'flex flex-col rounded-xl border bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md',
      selected ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-zinc-200', dim && 'opacity-60',
    )}>
      <div className="mb-3 h-1 w-10 self-center rounded-full" style={{ background: color }} />
      <div className="flex justify-center -space-x-4">
        <Avatar src={c.ketua.foto} name={c.ketua.nama} size={76} />
        <Avatar src={c.wakil.foto} name={c.wakil.nama} size={76} />
      </div>
      <h3 className="mt-3 text-center text-sm font-semibold leading-snug">{c.ketua.nama} &amp; {c.wakil.nama}</h3>
      <p className="mt-0.5 text-center text-xs text-zinc-500">Ketua &amp; Wakil Ketua BEM {c.jurusan}</p>
      <p className="text-center text-[11px] text-zinc-400">Kampus {c.kampus}</p>

      <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-center">
        <p className="text-xs font-medium text-zinc-700">Visi</p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{c.visi}</p>
      </div>

      {misi.length > 0 && (
        <Collapsible label="Lihat misi">
          <ol className="mt-2 space-y-1.5 rounded-lg bg-zinc-50 p-3 text-left text-xs text-zinc-600">
            {misi.map((m, i) => (
              <li key={i} className="flex gap-2"><span className="font-mono text-zinc-400">{i + 1}</span><span>{m}</span></li>
            ))}
          </ol>
        </Collapsible>
      )}

      {votes !== undefined && (
        <div className="mt-3 text-center">
          <p className="text-[11px] text-zinc-400">Suara sementara</p>
          <CountUp value={votes} className="text-lg font-semibold" />
        </div>
      )}
      <div className="mt-auto pt-4">{footer}</div>
    </article>
  );
}
