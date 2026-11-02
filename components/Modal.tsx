'use client';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import anime from 'animejs';
import { X } from 'lucide-react';

/** Bottom-sheet di mobile, dialog di desktop. Animasi masuk/keluar dengan anime.js. */
export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: (close: () => void) => React.ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    anime({ targets: overlay.current, opacity: 0, duration: 200, easing: 'linear' });
    anime({ targets: panel.current, opacity: 0, translateY: 14, duration: 220, easing: 'easeInQuad', complete: () => onClose() });
  }, [onClose]);

  useLayoutEffect(() => {
    anime.set(overlay.current, { opacity: 0 });
    anime.set(panel.current, { opacity: 0, translateY: 24 });
    anime({ targets: overlay.current, opacity: 1, duration: 220, easing: 'linear' });
    anime({ targets: panel.current, opacity: 1, translateY: 0, duration: 420, easing: 'easeOutExpo' });
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [close]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div ref={overlay} onClick={close} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" />
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={close} aria-label="Tutup" className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"><X size={16} /></button>
        </div>
        <div className="px-5 pb-5 pt-3">{children(close)}</div>
      </div>
    </div>
  );
}
