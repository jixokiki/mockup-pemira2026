'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import anime from 'animejs';
import { ArrowRight, BarChart3, CheckCircle2, Clock, Trophy, Vote, ShieldCheck } from 'lucide-react';
import { useEnter } from '@/lib/anim';
import { useMyElection } from '@/lib/hooks';
import { CountUp } from '@/components/ui';

export default function Page() {
  const e = useMyElection();
  const ref = useEnter<HTMLDivElement>();

  useEffect(() => {
    const a = anime({ targets: '.hero-shield', translateY: [-5, 5], rotate: [-3, 3], duration: 2600, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
    return () => a.pause();
  }, []);

  const stats = [
    { label: 'Total Pemilihan', icon: Trophy, color: 'text-blue-600', node: <><CountUp value={e.open ? 1 : 0} /> Aktif</> },
    { label: 'Sudah Memilih', icon: CheckCircle2, color: 'text-emerald-600', node: <><CountUp value={e.voted ? 1 : 0} /> dari 1</> },
    { label: 'Partisipasi', icon: BarChart3, color: 'text-brand-orange', node: <CountUp value={e.participation} decimals={1} suffix=" %" /> },
    { label: 'Sisa Waktu', icon: Clock, color: 'text-amber-500', node: <><CountUp value={e.days} /> Hari</> },
  ];

  return (
    <div ref={ref} className="space-y-5">
      <section data-anim className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue via-[#7a62b8] to-brand-orange p-6 text-white sm:p-8">
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-md">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Selamat Datang di PemiraUEU! 👋</h1>
          <p className="mt-1.5 text-sm text-white/80">Suarakan aspirasimu untuk masa depan organisasi yang lebih baik.</p>
          <Link href="/voter/pemilihan" className="btn mt-5 bg-white text-zinc-900 shadow-sm hover:bg-zinc-100"><Vote size={15} /> Mulai Voting Sekarang</Link>
        </div>
        <div className="hero-shield absolute right-6 top-1/2 hidden h-24 w-24 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur-sm sm:grid"><ShieldCheck size={44} /></div>
      </section>

      <section data-anim className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, icon: Icon, color, node }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className={`mt-2 flex items-center gap-2 text-xl font-semibold ${color}`}><Icon size={18} />{node}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section data-anim className="card">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold">Pemilihan Aktif</h2>
            <Link href="/voter/pemilihan" className="flex items-center gap-1 text-xs font-medium text-brand-orange">Lihat Semua <ArrowRight size={13} /></Link>
          </div>
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500"><Trophy size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.name}</p>
              <p className="text-xs text-zinc-500">{e.rows.length} kandidat · {e.days} hari lagi · Kampus {e.k}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={e.voted ? 'badge-green' : 'badge-amber'}>{e.voted ? 'Sudah Memilih' : 'Belum Memilih'}</span>
              {e.voted || !e.open || !e.rows.length
                ? <button className="btn-outline h-8 px-3 text-xs" disabled>Selesai</button>
                : <Link href="/voter/pemilihan" className="btn-blue h-8 px-3 text-xs">Vote</Link>}
            </div>
          </div>
          {!e.rows.length && <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-400">Belum ada paslon untuk jurusan Anda. Menunggu admin menginput kandidat.</p>}
        </section>

        <section data-anim className="card">
          <div className="border-b border-zinc-100 px-5 py-4"><h2 className="text-sm font-semibold">Aksi Cepat</h2></div>
          <div className="space-y-2.5 p-4">
            {[
              { href: '/voter/pemilihan', icon: Vote, t: 'Mulai Voting', d: 'Berpartisipasi dalam pemilihan yang tersedia', c: 'bg-blue-50 text-blue-600' },
              { href: '/voter/quick-count', icon: BarChart3, t: 'Lihat Quick Count', d: 'Pantau hasil sementara pemilihan', c: 'bg-orange-50 text-brand-orange' },
            ].map(({ href, icon: Icon, t, d, c }) => (
              <Link key={href} href={href} className="group flex items-center gap-3 rounded-lg border border-zinc-200 p-3 transition hover:border-zinc-300 hover:bg-zinc-50">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${c}`}><Icon size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t}</span><span className="block text-[11px] text-zinc-500">{d}</span></span>
                <ArrowRight size={15} className="text-zinc-400 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
