import anime from 'animejs';
import { useLayoutEffect, useRef } from 'react';

export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Entrance bertahap untuk semua elemen [data-anim] di dalam ref.
 * Jalankan ulang dengan mengubah `deps`.
 */
export function useEnter<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-anim]'));
    if (!els.length || prefersReduced()) return;
    anime.set(els, { opacity: 0, translateY: 16 });
    const a = anime({
      targets: els,
      opacity: 1,
      translateY: 0,
      delay: anime.stagger(55),
      duration: 650,
      easing: 'easeOutQuart',
    });
    return () => {
      a.pause();
      anime.set(els, { opacity: 1, translateY: 0 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
