'use client';
import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ToastKind } from '@/lib/toast';

interface Item { id: number; message: string; kind: ToastKind }

function ToastItem({ item, onDone }: { item: Item; onDone: (id: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    anime({ targets: el, opacity: [0, 1], translateY: [-12, 0], scale: [0.96, 1], duration: 380, easing: 'easeOutExpo' });
    const t = setTimeout(() => {
      anime({ targets: el, opacity: 0, translateY: -8, duration: 240, easing: 'easeInQuad', complete: () => onDone(item.id) });
    }, 3200);
    return () => clearTimeout(t);
  }, [item.id, onDone]);

  const Icon = item.kind === 'success' ? CheckCircle2 : item.kind === 'error' ? XCircle : Info;
  const color = item.kind === 'success' ? 'text-emerald-600' : item.kind === 'error' ? 'text-red-600' : 'text-blue-600';
  return (
    <div ref={ref} style={{ opacity: 0 }} className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm shadow-lg">
      <Icon size={16} className={color} />
      <span>{item.message}</span>
    </div>
  );
}

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    let n = 0;
    const h = (e: Event) => {
      const d = (e as CustomEvent<{ message: string; kind: ToastKind }>).detail;
      setItems((p) => [...p.slice(-2), { id: ++n + Date.now(), ...d }]);
    };
    window.addEventListener('pemira:toast', h);
    return () => window.removeEventListener('pemira:toast', h);
  }, []);
  const done = (id: number) => setItems((p) => p.filter((x) => x.id !== id));
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {items.map((i) => <ToastItem key={i.id} item={i} onDone={done} />)}
    </div>
  );
}
