'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

interface CardItem {
  tag: string;
  big: string;
  sub: string;
  color: string;
  bar?: number;
}

const CARDS: CardItem[] = [
  { tag: 'Pemilihan', big: 'BEM', sub: 'Ketua & Wakil Ketua', color: '#1a5cff' },
  { tag: 'Kebon Jeruk', big: '64%', sub: 'Partisipasi', color: '#1a5cff', bar: 64 },
  { tag: 'Citra Raya', big: '41%', sub: 'Partisipasi', color: '#ff5414', bar: 41 },
  { tag: 'Harapan Indah', big: '27%', sub: 'Partisipasi', color: '#10b981', bar: 27 },
  { tag: 'Quick count', big: 'LIVE', sub: 'Real-time', color: '#ff5414' },
  { tag: 'Per jurusan', big: 'Rekap', sub: 'Dipilah per jurusan', color: '#8b5cf6' },
  { tag: 'Aturan', big: '1:1', sub: 'Satu NIM, satu suara', color: '#10b981' },
  { tag: 'Hasil', big: 'Hasil', sub: 'Tercatat seketika', color: '#1a5cff' },
  { tag: 'Pemira', big: 'UEU', sub: 'Universitas Esa Unggul', color: '#ff5414' },
];

const TUNNEL_CARDS = CARDS.map((item, index) => {
  const a = index * 137.5 * (Math.PI / 180); // golden angle
  return {
    item,
    index,
    cos: Math.cos(a),
    sin: Math.sin(a),
    rx: 0.28 + (index % 3) * 0.08,
    ry: 0.26 + (index % 2) * 0.09,
    rot: (index % 2 === 0 ? 1 : -1) * (3 + (index % 5) * 2),
  };
});

type TunnelCardData = (typeof TUNNEL_CARDS)[number];

const SPRING = { stiffness: 60, damping: 25, mass: 0.5 };

interface Stage {
  width: number;
  height: number;
  isMobile: boolean;
}

function usePointerParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled, rawX, rawY]);
  return { x, y };
}

interface CardProps {
  card: TunnelCardData;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  total: number;
  stage: Stage;
  mode: 'scroll' | 'ambient';
}

function TunnelCard({ card, progress, pointer, total, stage, mode }: CardProps) {
  const span = 0.55;
  const start = (card.index / total) * (1 - span);

  // scroll: tiap kartu punya jendela waktu sendiri; ambient: semua kartu berputar terus (loop mulus)
  const local = useTransform(progress, (v) => {
    if (mode === 'ambient') return (v + card.index / total) % 1;
    return Math.min(1, Math.max(0, (v - start) / span));
  });

  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;
  const z = useTransform(local, [0, 1], [farZ, nearZ]);
  const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const width = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(140, Math.min(250, stage.width * 0.2));

  const baseX = card.cos * (stage.width * card.rx);
  const baseY = card.sin * (stage.height * card.ry);
  const pan = stage.isMobile ? 20 : 45;

  const transform = useTransform([z, pointer.x, pointer.y], ([cz, px, py]: number[]) => {
    const ox = baseX - px * pan;
    const oy = baseY - py * pan;
    return `translate3d(calc(-50% + ${ox}px), calc(-50% + ${oy}px), ${cz}px) rotateZ(${card.rot}deg)`;
  });

  const { tag, big, sub, color, bar } = card.item;

  return (
    <motion.div
      style={{ width, transform, opacity, zIndex: card.index + 1 }}
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-[4/5] select-none will-change-transform"
    >
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-3.5 shadow-2xl shadow-black/80"
        style={{ backgroundImage: `radial-gradient(120% 80% at 100% 0%, ${color}40, transparent 60%)` }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">{tag}</span>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        </div>
        <div>
          <div className="text-3xl font-semibold tracking-tight text-white">{big}</div>
          <div className="mt-1 text-xs text-zinc-400">{sub}</div>
          {bar !== undefined && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${bar}%`, background: color }} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TunnelSceneProps {
  mode: 'scroll' | 'ambient';
  className?: string;
  bg?: string;
  onComplete?: () => void;
  children?: ReactNode;
}

export default function TunnelScene({ mode, className = '', bg = '#09090b', onComplete, children }: TunnelSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>({ width: 1440, height: 900, isMobile: false });

  // ukur container (bukan window) supaya pas dipakai di panel kiri juga
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setStage({ width: r.width, height: r.height, isMobile: r.width < 640 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rawProgress = useMotionValue(0);
  const smooth = useSpring(rawProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });
  const progress = mode === 'ambient' ? rawProgress : smooth;

  // mode ambient: berputar otomatis tanpa henti
  useEffect(() => {
    if (mode !== 'ambient') return;
    if (reduce) {
      rawProgress.set(0.5);
      return;
    }
    const c = animate(rawProgress, 1, { duration: 32, ease: 'linear', repeat: Infinity });
    return () => c.stop();
  }, [mode, reduce, rawProgress]);

  // mode scroll: wheel, swipe, keyboard
  useEffect(() => {
    if (mode !== 'scroll') return;
    const el = ref.current;
    if (!el) return;
    const bump = (d: number) => rawProgress.set(Math.min(1, Math.max(0, rawProgress.get() + d)));
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      bump(e.deltaY * 0.0008);
    };
    let lastY = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      bump((lastY - y) * 0.003);
      lastY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') bump(0.08);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') bump(-0.08);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [mode, rawProgress]);

  // selesai begitu progress mendekati ujung
  useEffect(() => {
    if (mode !== 'scroll' || !onComplete) return;
    let done = false;
    return smooth.on('change', (v) => {
      if (!done && v > 0.985) {
        done = true;
        onComplete();
      }
    });
  }, [mode, onComplete, smooth]);

  const pointer = usePointerParallax(!reduce);

  const titleScale = useTransform(smooth, [0, 0.5, 1], [0.75, 1, 1.35]);
  const titleOpacity = useTransform(smooth, [0, 0.1, 0.8, 1], [0.3, 1, 1, 0]);
  const promptOpacity = useTransform(smooth, [0, 0.1], [1, 0]);

  return (
    <div
      ref={ref}
    //   className={`relative select-none overflow-hidden bg-[#09090b] text-white ${className}`}
    //   style={{
    //     perspective: stage.isMobile ? '900px' : '1200px',
    className={`relative select-none overflow-hidden text-white ${className}`}
      style={{
        backgroundColor: bg,
        perspective: stage.isMobile ? '900px' : '1200px',
        transformStyle: 'preserve-3d',
        touchAction: mode === 'scroll' ? 'none' : undefined,
      }}
    >
      {/* dot grid + glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)] opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-blue/25 via-violet-500/10 to-brand-orange/25 blur-[110px]" />

      {/* ring panduan kedalaman */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[48vmin] w-[48vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[76vmin] w-[76vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.07]" />

      {/* judul tengah (khusus mode scroll) */}
      {mode === 'scroll' && (
        <>
          <motion.div
            style={{ scale: titleScale, opacity: titleOpacity }}
            className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-brand-orange">Pemira UEU 2026</p>
            <h1 className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-5xl font-bold leading-[0.95] tracking-tighter text-transparent sm:text-7xl md:text-8xl">
              Satu suara,
              <br />
              tercatat seketika.
            </h1>
            <p className="mt-5 max-w-[40ch] text-sm font-light text-zinc-400 sm:text-base">
              Pemilihan ketua dan wakil ketua BEM di tiga kampus, dengan quick count real-time.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: promptOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-zinc-400"
          >
            <span>Gulir untuk masuk</span>
            <div className="h-6 w-px bg-gradient-to-b from-brand-blue to-transparent" />
          </motion.div>

          <motion.div
            style={{ scaleX: smooth }}
            className="absolute bottom-0 left-0 z-20 h-px w-full origin-left bg-gradient-to-r from-brand-blue to-brand-orange"
          />
        </>
      )}

      {/* bidang 3D */}
      <div className="pointer-events-none absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {TUNNEL_CARDS.map((card) => (
          <TunnelCard
            key={card.index}
            card={card}
            progress={progress}
            pointer={pointer}
            total={TUNNEL_CARDS.length}
            stage={stage}
            mode={mode}
          />
        ))}
      </div>

      {children}
    </div>
  );
}