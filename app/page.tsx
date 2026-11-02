'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import anime from 'animejs';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { JURUSAN, KAMPUS, Jurusan, Kampus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { prefersReduced } from '@/lib/anim';
import { AnimatePresence, motion } from 'framer-motion';
import TunnelScene from '@/components/TunnelScene';
import PosterPanel from '@/components/PosterPanel';

const TALLY = [
  { label: 'Kebon Jeruk', v: 64, bar: 'from-brand-blue to-sky-400' },
  { label: 'Citra Raya', v: 41, bar: 'from-brand-orange to-amber-400' },
  { label: 'Harapan Indah', v: 27, bar: 'from-emerald-500 to-teal-300' },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [role, setRole] = useState<'voter' | 'admin'>('voter');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [kampus, setKampus] = useState<Kampus>(KAMPUS[0]);
  const [jurusan, setJurusan] = useState<Jurusan>(JURUSAN[0]);
  const [adminId, setAdminId] = useState('');
  const [pass, setPass] = useState('');
  // const [error, setError] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'intro' | 'login'>('intro');
  const root = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);

  // useLayoutEffect(() => {
  //   if (prefersReduced() || !root.current) return;
  //   const els = root.current.querySelectorAll('[data-in]');
  //   anime.set(els, { opacity: 0, translateY: 18 });
  //   anime({ targets: els, opacity: 1, translateY: 0, delay: anime.stagger(70), duration: 700, easing: 'easeOutQuart' });
  // }, []);
  useLayoutEffect(() => {
    if (phase !== 'login' || prefersReduced() || !root.current) return;
    const els = root.current.querySelectorAll('[data-in]');
    anime.set(els, { opacity: 0, translateY: 18 });
    anime({ targets: els, opacity: 1, translateY: 0, delay: anime.stagger(70), duration: 700, easing: 'easeOutQuart' });
  }, [phase]);

  // motif "tally" di panel kiri
  // useEffect(() => {
  //   if (prefersReduced()) return;
  //   const a = anime({
  //     targets: '.tally-bar',
  //     width: () => `${anime.random(28, 92)}%`,
  //     duration: 2200,
  //     delay: anime.stagger(180),
  //     direction: 'alternate',
  //     loop: true,
  //     easing: 'easeInOutSine',
  //   });
  //   return () => a.pause();
  // }, []);
    // panel kiri: bar terisi + angka count-up
  // useEffect(() => {
  //   if (prefersReduced()) return;
  //   const bars = document.querySelectorAll<HTMLElement>('.tally-bar');
  //   const nums = document.querySelectorAll<HTMLElement>('.tally-num');
  //   anime.set(bars, { width: '0%' });
  //   const a = anime({
  //     targets: bars,
  //     width: (el: HTMLElement) => `${el.dataset.v}%`,
  //     duration: 1600,
  //     delay: anime.stagger(150, { start: 500 }),
  //     easing: 'easeOutExpo',
  //   });
  //   const counters = Array.from(nums).map((el, i) => {
  //     const o = { v: 0 };
  //     return anime({
  //       targets: o,
  //       v: Number(el.dataset.v),
  //       round: 1,
  //       duration: 1600,
  //       delay: 500 + i * 150,
  //       easing: 'easeOutExpo',
  //       update: () => { el.textContent = `${o.v}%`; },
  //     });
  //   });
  //   return () => { a.pause(); counters.forEach((c) => c.pause()); };
  // }, []);
    // pengguna dengan reduced-motion langsung ke form tanpa intro
  useEffect(() => {
    if (prefersReduced()) setPhase('login');
  }, []);

  const fail = (m: string) => {
    setError(m);
    anime({ targets: form.current, translateX: [-8, 8, -6, 6, -3, 3, 0], duration: 420, easing: 'easeInOutSine' });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (role === 'voter') {
      if (nama.trim().length < 3) return fail('Nama minimal 3 karakter.');
      if (!/^[0-9]{6,12}$/.test(nim)) return fail('NIM harus 6–12 digit angka.');
      login({ role: 'voter', nama: nama.trim(), nim, kampus, jurusan });
      router.push('/voter/dashboard');
    } else {
      if (adminId !== 'admin' || pass !== 'admin123') return fail('ID atau password admin salah.');
      login({ role: 'admin', nama: 'Admin Pemira' });
      router.push('/admin/dashboard');
    }
  };

  return (
    <div ref={root} className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand-blue/40 blur-[110px]" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-brand-orange/30 blur-[110px]" />
        <span data-in className="relative text-xl font-bold tracking-tight">Pemira<span className="text-brand-orange">UEU</span></span>
        <div className="relative max-w-md">
          <h1 data-in className="text-4xl font-semibold leading-[1.1] tracking-tight">Satu suara,<br />tercatat seketika.</h1>
          <p data-in className="mt-4 text-sm leading-relaxed text-zinc-400">Pemilihan ketua dan wakil ketua BEM di tiga kampus, dipilah per jurusan, dengan quick count real-time.</p>
          <div data-in className="mt-10 space-y-3">
            {['bg-brand-blue', 'bg-brand-orange', 'bg-emerald-500'].map((c, i) => (
              <div key={c} className="h-2 overflow-hidden rounded-full bg-white/10"><div className={cn('tally-bar h-full rounded-full', c)} style={{ width: `${[64, 41, 27][i]}%` }} /></div>
            ))}
          </div>
        </div>
        <p data-in className="relative text-xs text-zinc-500">Kebon Jeruk · Citra Raya · Harapan Indah</p>
      </section> */}
      {/* <section className="relative hidden overflow-hidden bg-[#09090b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        dot grid dengan fade mask
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 38%, #000 25%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 38%, #000 25%, transparent 100%)',
          }}
        />
        aurora glow
        <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-blue/50 via-violet-500/25 to-brand-orange/40 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent" />

        top bar
        <div data-in className="relative flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">Pemira<span className="text-brand-orange">UEU</span></span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Quick count real-time
          </span>
        </div>

        konten tengah
        <div className="relative max-w-md">
          <h1 data-in className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent">
            Satu suara,<br />tercatat seketika.
          </h1>
          <p data-in className="mt-5 text-[15px] leading-relaxed text-zinc-400">
            Pemilihan ketua dan wakil ketua BEM di tiga kampus, dipilah per jurusan, dengan quick count real-time.
          </p>

          glass card
          <div data-in className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_20px_50px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Partisipasi per kampus</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400">Live</span>
            </div>
            <div className="space-y-4">
              {TALLY.map((t) => (
                <div key={t.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{t.label}</span>
                    <span className="tally-num font-mono tabular-nums text-zinc-200" data-v={t.v}>{t.v}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={cn('tally-bar h-full rounded-full bg-gradient-to-r', t.bar)} data-v={t.v} style={{ width: `${t.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p data-in className="relative text-xs text-zinc-500">Pemilihan Raya Mahasiswa · Universitas Esa Unggul</p>
      </section> */}
      {/* <section className="relative hidden overflow-hidden bg-[#09090b] lg:block">
        <TunnelScene mode="ambient" className="absolute inset-0">
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-12">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#09090b] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-transparent" />

            <div data-in className="relative flex items-center justify-between">
              <span className="text-xl font-bold tracking-tight">Pemira<span className="text-brand-orange">UEU</span></span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Quick count real-time
              </span>
            </div>

            <div className="relative max-w-md">
              <h1 data-in className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent">
                Satu suara,<br />tercatat seketika.
              </h1>
              <p data-in className="mt-5 text-[15px] leading-relaxed text-zinc-400">
                Pemilihan ketua dan wakil ketua BEM di tiga kampus, dipilah per jurusan, dengan quick count real-time.
              </p>
              <p data-in className="mt-8 text-xs text-zinc-500">Kebon Jeruk · Citra Raya · Harapan Indah</p>
            </div>
          </div>
        </TunnelScene>
      </section> */}
      <section className="relative hidden overflow-hidden bg-[#1c304b] lg:block">
        {phase === 'login' && <PosterPanel />}
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <span data-in className="mb-8 block text-xl font-bold tracking-tight lg:hidden"><span className="text-brand-blue">Pemira</span><span className="text-brand-orange">UEU</span></span>
          <h2 data-in className="text-2xl font-semibold tracking-tight">Masuk</h2>
          <p data-in className="mt-1 text-sm text-zinc-500">Pilih peran Anda untuk melanjutkan.</p>

          <div data-in className="mt-6 grid grid-cols-2 rounded-lg bg-zinc-100 p-1 text-sm font-medium">
            {(['voter', 'admin'] as const).map((r) => (
              <button key={r} type="button" onClick={() => { setRole(r); setError(''); }}
                className={cn('rounded-md py-1.5 transition', role === r ? 'bg-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800')}>
                {r === 'voter' ? 'Mahasiswa' : 'Admin'}
              </button>
            ))}
          </div>

          <form ref={form} onSubmit={submit} className="mt-5 space-y-4" data-in>
            {role === 'voter' ? (
              <>
                <div><label className="label">Nama lengkap</label><input className="input" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Mahasiswa UEU" /></div>
                <div><label className="label">NIM</label><input className="input" inputMode="numeric" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="20230801001" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Kampus</label><select className="input" value={kampus} onChange={(e) => setKampus(e.target.value as Kampus)}>{KAMPUS.map((k) => <option key={k}>{k}</option>)}</select></div>
                  <div><label className="label">Jurusan</label><select className="input" value={jurusan} onChange={(e) => setJurusan(e.target.value as Jurusan)}>{JURUSAN.map((j) => <option key={j}>{j}</option>)}</select></div>
                </div>
              </>
            ) : (
              <>
                <div><label className="label">ID Admin</label><input className="input" value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="admin" /></div>
                <div><label className="label">Password</label><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" /></div>
                <p className="flex items-center gap-1.5 text-[11px] text-zinc-400"><ShieldCheck size={12} /> Demo: ID <b>admin</b> · password <b>admin123</b></p>
              </>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button className="btn-primary h-10 w-full">Lanjutkan <ArrowRight size={15} /></button>
          </form>
          <p data-in className="mt-6 text-center text-[11px] text-zinc-400">© 2026 Universitas Esa Unggul</p>
        </div>
      </section>
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-50"
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.7, ease: 'easeInOut' } }}
          >
            <TunnelScene mode="scroll" bg="#1c304b" className="h-full w-full" onComplete={() => setPhase('login')}>
              <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-6 sm:p-8">
                <span className="text-lg font-bold tracking-tight">Pemira<span className="text-brand-orange">UEU</span></span>
                <button
                  type="button"
                  onClick={() => setPhase('login')}
                  className="pointer-events-auto rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur transition hover:bg-white/10 hover:text-white"
                >
                  Lewati intro →
                </button>
              </div>
            </TunnelScene>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
