'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import anime from 'animejs';
import { BarChart3, Bell, ChevronDown, LayoutDashboard, LogOut, Settings, UserRound, Vote, UserPlus } from 'lucide-react';
import { Avatar } from './ui';
import { useStore } from '@/lib/store';
import { cn, daysLeft } from '@/lib/utils';

type Item = { href: string; label: string; icon: typeof Vote };
const VOTER_NAV: Item[] = [
  { href: '/voter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/voter/pemilihan', label: 'Pemilihan', icon: Vote },
  { href: '/voter/quick-count', label: 'Quick Count', icon: BarChart3 },
  { href: '/voter/profil', label: 'Profil', icon: UserRound },
  { href: '/voter/pengaturan', label: 'Pengaturan', icon: Settings },
];
const ADMIN_NAV: Item[] = [
  { href: '/admin/dashboard', label: 'Quick Count', icon: BarChart3 },
  { href: '/admin/kandidat', label: 'Input Kandidat', icon: UserPlus },
];

function Logo({ className }: { className?: string }) {
  return <span className={cn('text-[19px] font-bold tracking-tight', className)}><span className="text-brand-blue">Pemira</span><span className="text-brand-orange">UEU</span></span>;
}

function useOutside(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

function popIn(el: HTMLElement | null) {
  if (el) anime({ targets: el, opacity: [0, 1], translateY: [-6, 0], scale: [0.97, 1], duration: 260, easing: 'easeOutCubic' });
}

function SideNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    const a = wrap.current?.querySelector<HTMLElement>('[data-active="true"]');
    const p = pill.current;
    if (!p) return;
    if (!a) { anime.set(p, { opacity: 0 }); return; }
    if (first.current) { anime.set(p, { translateY: a.offsetTop, height: a.offsetHeight, opacity: 1 }); first.current = false; }
    else anime({ targets: p, translateY: a.offsetTop, height: a.offsetHeight, opacity: 1, duration: 450, easing: 'easeOutExpo' });
  }, [pathname]);
  return (
    <div ref={wrap} className="relative space-y-1">
      <div ref={pill} className="absolute inset-x-0 top-0 rounded-lg border-r-2 border-blue-600 bg-blue-50" style={{ opacity: 0 }} />
      {items.map((it) => {
        const on = pathname === it.href;
        const Icon = it.icon;
        return (
          <Link key={it.href} href={it.href} data-active={on}
            className={cn('relative z-10 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors', on ? 'text-blue-600' : 'text-zinc-600 hover:text-zinc-900')}>
            <Icon size={16} /> {it.label}
          </Link>
        );
      })}
    </div>
  );
}

function BellMenu({ notes }: { notes: { t: string; d: string }[] }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  useOutside(box, () => setOpen(false));
  useEffect(() => { if (open) popIn(pop.current); }, [open]);
  const n = seen ? 0 : notes.length;
  return (
    <div ref={box} className="relative">
      <button ref={btn} aria-label="Notifikasi" className="relative rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100"
        onClick={() => { setOpen((o) => !o); setSeen(true); anime({ targets: btn.current, rotate: [0, -14, 12, -8, 5, 0], duration: 600, easing: 'easeInOutSine' }); }}>
        <Bell size={18} />
        {n > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-orange px-1 text-[10px] font-semibold text-white">{n}</span>}
      </button>
      {open && (
        <div ref={pop} className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
          {notes.length === 0 && <p className="p-3 text-xs text-zinc-400">Tidak ada notifikasi.</p>}
          {notes.map((x, i) => (
            <div key={i} className="rounded-lg p-2.5 hover:bg-zinc-50"><p className="text-xs font-medium">{x.t}</p><p className="mt-0.5 text-xs text-zinc-500">{x.d}</p></div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu({ role }: { role: 'voter' | 'admin' }) {
  const session = useStore((s) => s.session)!;
  const logout = useStore((s) => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  useOutside(box, () => setOpen(false));
  useEffect(() => { if (open) popIn(pop.current); }, [open]);
  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-zinc-100">
        <Avatar src={session.foto} name={session.nama} size={30} className="ring-0" />
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-semibold leading-tight">{session.nama}</span>
          <span className="block text-[11px] leading-tight text-zinc-500">{role === 'voter' ? session.jurusan : 'Administrator'}</span>
        </span>
        <ChevronDown size={14} className="text-zinc-400" />
      </button>
      {open && (
        <div ref={pop} className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
          <div className="px-2.5 py-2">
            <p className="text-xs font-semibold">{session.nama}</p>
            <p className="text-[11px] text-zinc-500">{role === 'voter' ? `${session.kampus} · ${session.jurusan}` : 'Panel admin'}</p>
          </div>
          <button onClick={() => { logout(); router.replace('/'); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 transition hover:bg-red-50">
            <LogOut size={15} /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ role, children }: { role: 'voter' | 'admin'; children: React.ReactNode }) {
  const items = role === 'voter' ? VOTER_NAV : ADMIN_NAV;
  const pathname = usePathname();
  const session = useStore((s) => s.session)!;
  const votes = useStore((s) => s.votes);
  const endsAt = useStore((s) => s.endsAt);

  const notes: { t: string; d: string }[] = [];
  if (role === 'voter') {
    const voted = votes.some((v) => v.voterId === session.nim && v.kampus === session.kampus && v.jurusan === session.jurusan);
    if (!voted) notes.push({ t: 'Anda belum memilih', d: `Pemilihan BEM ${session.jurusan} ditutup ${daysLeft(endsAt)} hari lagi.` });
    notes.push({ t: 'Quick count aktif', d: 'Hasil sementara diperbarui real-time.' });
  } else {
    notes.push({ t: 'Suara masuk', d: `${votes.length.toLocaleString('id-ID')} suara tercatat di seluruh kampus.` });
  }

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="px-5 pb-4 pt-5"><Logo /></div>
        <div className="mx-3 mb-4 flex items-center gap-2.5 rounded-xl bg-zinc-50 p-2.5">
          <Avatar src={session.foto} name={session.nama} size={34} className="ring-0" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{session.nama}</p>
            <p className="truncate text-[11px] text-zinc-500">{role === 'voter' ? session.jurusan : 'Administrator'}</p>
          </div>
        </div>
        <nav className="flex-1 px-3"><SideNav items={items} /></nav>
        {role === 'voter' && <p className="px-5 pb-5 text-[11px] leading-relaxed text-zinc-400">Kampus {session.kampus}<br />Hanya pemilihan jurusan Anda yang tampil.</p>}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur lg:px-8">
        <Logo className="lg:hidden" />
        <p className="hidden text-sm font-medium text-zinc-500 lg:block">{items.find((i) => i.href === pathname)?.label}</p>
        <div className="flex items-center gap-1"><BellMenu notes={notes} /><UserMenu role={role} /></div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-1">
          {items.map((it) => {
            const on = pathname === it.href;
            const Icon = it.icon;
            return (
              <Link key={it.href} href={it.href} className={cn('relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors', on ? 'text-blue-600' : 'text-zinc-400')}>
                {on && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-blue-600" />}
                <Icon size={19} />{it.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
