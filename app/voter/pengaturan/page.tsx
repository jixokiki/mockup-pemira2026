'use client';
import { useLayoutEffect, useRef } from 'react';
import anime from 'animejs';
import { RotateCcw } from 'lucide-react';
import { useEnter } from '@/lib/anim';
import { useStore } from '@/lib/store';
import { toast } from '@/lib/toast';

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  const knob = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) { anime.set(knob.current, { translateX: on ? 20 : 0 }); first.current = false; return; }
    anime({ targets: knob.current, translateX: on ? 20 : 0, duration: 350, easing: 'easeOutBack' });
  }, [on]);
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${on ? 'bg-blue-600' : 'bg-zinc-200'}`}>
      <span ref={knob} className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}

export default function Page() {
  const prefs = useStore((s) => s.prefs);
  const setPref = useStore((s) => s.setPref);
  const reset = useStore((s) => s.resetDemo);
  const ref = useEnter<HTMLDivElement>();
  const rows = [
    { k: 'notif' as const, t: 'Notifikasi email', d: 'Terima kabar pemilihan lewat email' },
    { k: 'reminder' as const, t: 'Pengingat voting', d: 'Ingatkan sebelum pemilihan ditutup' },
  ];
  return (
    <div ref={ref} className="space-y-5">
      <h1 data-anim className="text-lg font-semibold tracking-tight">Pengaturan</h1>
      <section data-anim className="card divide-y divide-zinc-100">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between gap-4 px-5 py-4">
            <div><p className="text-sm font-medium">{r.t}</p><p className="text-xs text-zinc-500">{r.d}</p></div>
            <Switch on={prefs[r.k]} onChange={(v) => setPref(r.k, v)} label={r.t} />
          </div>
        ))}
      </section>
      <section data-anim className="card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div><p className="text-sm font-medium">Reset data demo</p><p className="text-xs text-zinc-500">Mengembalikan kandidat dan suara ke data awal.</p></div>
        <button className="btn-danger" onClick={() => { reset(); toast('Data demo dikembalikan', 'info'); }}><RotateCcw size={14} /> Reset</button>
      </section>
    </div>
  );
}
