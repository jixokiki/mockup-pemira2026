'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { ChevronDown, User } from 'lucide-react';
import { cn, initials } from '@/lib/utils';

export function Avatar({ src, name, size = 40, className }: { src?: string; name: string; size?: number; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} style={{ width: size, height: size }} className={cn('shrink-0 rounded-full bg-zinc-100 object-cover ring-2 ring-white', className)} />;
  }
  const ini = initials(name);
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.36 }} className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-500 ring-2 ring-white', className)}>
      {ini || <User size={size * 0.5} />}
    </span>
  );
}

export function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

/** Angka yang menghitung naik / turun dengan anime.js */
export function CountUp({ value, decimals = 0, suffix = '', className }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  const fmt = (n: number) => n.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = { v: prev.current };
    const a = anime({
      targets: o,
      v: value,
      duration: 1100,
      easing: 'easeOutExpo',
      update: () => { el.textContent = fmt(o.v); },
      complete: () => { prev.current = value; el.textContent = fmt(value); },
    });
    return () => a.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span ref={ref} className={cn('tabular-nums', className)}>{fmt(0)}</span>;
}

/** Progress bar yang tumbuh dari nilai sebelumnya ke nilai baru */
export function Bar({ pct, color, className }: { pct: number; color: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = anime({
      targets: el,
      width: [`${prev.current}%`, `${pct}%`],
      duration: 950,
      easing: 'easeOutExpo',
      complete: () => { prev.current = pct; },
    });
    return () => a.pause();
  }, [pct]);
  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-zinc-100', className)}>
      <div ref={ref} className="h-full rounded-full" style={{ width: 0, background: color }} />
    </div>
  );
}

/** Buka/tutup dengan animasi tinggi */
export function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const icon = useRef<SVGSVGElement>(null);
  const toggle = () => {
    const el = body.current;
    if (!el) return;
    const next = !open;
    setOpen(next);
    anime.remove(el);
    anime({
      targets: el,
      height: next ? [0, el.scrollHeight] : [el.offsetHeight, 0],
      opacity: next ? [0, 1] : [1, 0],
      duration: 320,
      easing: 'easeOutCubic',
      complete: () => { if (next) el.style.height = 'auto'; },
    });
    if (icon.current) anime({ targets: icon.current, rotate: next ? 180 : 0, duration: 250, easing: 'easeOutCubic' });
  };
  return (
    <div className="mt-2">
      <button type="button" onClick={toggle} className="mx-auto flex items-center gap-1 text-xs font-medium text-zinc-500 transition hover:text-zinc-900">
        {label} <ChevronDown ref={icon} size={14} />
      </button>
      <div ref={body} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

/** Tabs dengan indikator yang meluncur (anime.js) */
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    const a = wrap.current?.querySelector<HTMLElement>('[data-on="true"]');
    const b = bar.current;
    if (!a || !b) return;
    if (first.current) {
      anime.set(b, { translateX: a.offsetLeft, width: a.offsetWidth });
      first.current = false;
    } else {
      anime({ targets: b, translateX: a.offsetLeft, width: a.offsetWidth, duration: 400, easing: 'easeOutExpo' });
    }
  }, [value]);
  return (
    <div ref={wrap} className="relative flex gap-1 overflow-x-auto border-b border-zinc-200">
      {tabs.map((t) => (
        <button key={t.id} data-on={t.id === value} onClick={() => onChange(t.id)}
          className={cn('whitespace-nowrap px-3 pb-2.5 pt-1 text-sm font-medium transition', t.id === value ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900')}>
          {t.label}
        </button>
      ))}
      <div ref={bar} className="absolute bottom-0 left-0 h-0.5 rounded-full bg-blue-600" style={{ width: 0 }} />
    </div>
  );
}
