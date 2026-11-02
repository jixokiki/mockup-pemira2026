'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Yellowtail } from 'next/font/google';

const script = Yellowtail({ weight: '400', subsets: ['latin'] });

const GOLD_TEXT =
  'linear-gradient(100deg,#8a5a12 0%,#e5b44d 28%,#fff6c8 45%,#e5b44d 62%,#8a5a12 100%)';

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + (i % 3),
  dur: 9 + (i % 5) * 2.2,
  delay: (i % 7) * 1.3,
}));

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, delay, ease: 'easeOut' as const },
});

export default function PosterPanel() {
  const reduce = useReducedMotion();

  // posisi pointer (persen) -> spotlight + tilt 3D
  const mx = useMotionValue(50);
  const my = useMotionValue(35);
  const sx = useSpring(mx, { stiffness: 70, damping: 18 });
  const sy = useSpring(my, { stiffness: 70, damping: 18 });
  const spot = useMotionTemplate`radial-gradient(380px circle at ${sx}% ${sy}%, rgba(125,175,255,0.22), transparent 65%)`;
  const rotY = useTransform(sx, [0, 100], [-9, 9]);
  const rotX = useTransform(sy, [0, 100], [7, -7]);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };
  const onLeave = () => {
    mx.set(50);
    my.set(35);
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="absolute inset-0 overflow-hidden bg-[#1c304b] text-white"
    >
      {/* cahaya latar */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 60% at 50% 30%, rgba(70,120,190,.45) 0%, transparent 70%), radial-gradient(ellipse 120% 80% at 50% 110%, rgba(6,14,28,.65) 0%, transparent 60%)',
        }}
      />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: spot }} />

      {/* pola diamond di sisi kiri & kanan */}
      <motion.svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
        animate={reduce ? undefined : { opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <pattern id="pg-dia" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M7 4 L10 7 L7 10 L4 7 Z" fill="#8fb4ea" />
          </pattern>
          <linearGradient id="pg-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="pg-mask">
            <rect width="100%" height="100%" fill="url(#pg-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#pg-dia)" mask="url(#pg-mask)" opacity="0.3" />
      </motion.svg>

      {/* pita & garis emas */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 700 900"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="pg-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff2b8" />
            <stop offset="0.45" stopColor="#e5b44d" />
            <stop offset="1" stopColor="#8a5a12" />
          </linearGradient>
          <linearGradient id="pg-gold-r" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff2b8" />
            <stop offset="0.45" stopColor="#e5b44d" />
            <stop offset="1" stopColor="#8a5a12" />
          </linearGradient>
        </defs>

        <motion.path
          d="M-10 700 C 80 790 190 855 330 905 L 345 930 C 200 895 90 835 -10 740 Z"
          fill="url(#pg-gold)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        <motion.path
          d="M710 700 C 620 790 510 855 370 905 L 355 930 C 500 895 610 835 710 740 Z"
          fill="url(#pg-gold-r)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        {[
          'M-10 668 C 90 765 200 835 340 880',
          'M710 668 C 610 765 500 835 360 880',
          'M-10 140 C 70 90 130 40 210 -10',
          'M710 140 C 630 90 570 40 490 -10',
        ].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke="#f3cf6b"
            strokeOpacity={0.75}
            strokeWidth={1.5}
            fill="none"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.5 + i * 0.15, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* partikel emas */}
      {!reduce &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute bottom-0 rounded-full bg-[#f3cf6b]"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              boxShadow: '0 0 8px 1px rgba(243,207,107,.7)',
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -800, opacity: [0, 0.9, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

      {/* konten */}
      <div className="relative z-10 flex h-full flex-col justify-between p-12 pb-24">
        {/* top bar */}
        <motion.div {...rise(0.1)} className="flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            Pemira<span className="text-brand-orange">UEU</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur">
            {/* <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span> */}
            Quick count real-time
          </span>
        </motion.div>

        {/* judul */}
        <div className="flex flex-col items-center text-center" style={{ perspective: 900 }}>
          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
            className="flex flex-col items-center"
          >
            <motion.p
              {...rise(0.3)}
              className="mb-4 font-mono text-[11px] uppercase tracking-[0.4em] text-[#f3cf6b]"
            >
              Pemira UEU 2026
            </motion.p>

            <motion.span
              className="mb-3 block h-px w-full bg-gradient-to-r from-transparent via-[#f3cf6b]/70 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />

            <motion.h2
              {...rise(0.5)}
              className="text-[clamp(2.2rem,4.6vw,4.4rem)] font-extrabold uppercase italic leading-none tracking-tight"
            >
              <span
                className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
                style={{ filter: 'drop-shadow(0 4px 10px rgba(5,12,25,.55))' }}
              >
                Pemilihan
              </span>
            </motion.h2>

            <motion.span
              className="my-3 block h-px w-full bg-gradient-to-r from-transparent via-[#f3cf6b]/70 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.7 }}
            />

            <motion.div {...rise(0.7)} style={{ filter: 'drop-shadow(0 6px 14px rgba(5,12,25,.6))' }}>
              <motion.span
                className="block bg-clip-text text-[clamp(3rem,6.6vw,6.2rem)] font-black uppercase italic leading-[0.9] tracking-tight text-transparent"
                style={{ backgroundImage: GOLD_TEXT, backgroundSize: '250% 100%', backgroundPosition: '120% 0%' }}
                animate={reduce ? undefined : { backgroundPosition: ['120% 0%', '-20% 0%'] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
              >
                Umum
              </motion.span>
            </motion.div>

            <motion.div {...rise(0.9)} className="-mt-2">
              <span
                className={`${script.className} block -rotate-3 text-[clamp(2.6rem,5vw,4.6rem)] leading-none text-white`}
                style={{ filter: 'drop-shadow(0 4px 10px rgba(5,12,25,.6))' }}
              >
                Raya
              </span>
              <svg viewBox="0 0 300 12" className="mx-auto -mt-1 w-56" aria-hidden>
                <defs>
                  <linearGradient id="pg-brush" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#f3cf6b" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#f3cf6b" />
                    <stop offset="1" stopColor="#f3cf6b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M4 8 C 70 2 180 2 296 6"
                  stroke="url(#pg-brush)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, delay: 1.2 }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* ornamen */}
          <motion.div {...rise(1.1)} className="mt-10 w-full max-w-lg">
            <div className="mb-3 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rotate-45 bg-[#f3cf6b]"
                  animate={reduce ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.8, 1.25, 0.8] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f3cf6b]/70" />
              <span className="whitespace-nowrap text-[11px] font-medium tracking-[0.4em] text-white/85">
                UNIVERSITAS ESA UNGGUL
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#f3cf6b]/70" />
            </div>
          </motion.div>
        </div>

        {/* bawah */}
        <motion.div {...rise(1.3)} className="mx-auto max-w-sm text-center">
          <p className="text-sm leading-relaxed text-white/65">
            Pemilihan ketua dan wakil ketua BEM di tiga kampus, dipilah per jurusan, dengan quick count real-time.
          </p>
          <p className="mt-3 text-xs text-white/40">Kebon Jeruk · Citra Raya · Harapan Indah</p>
        </motion.div>
      </div>
    </div>
  );
}