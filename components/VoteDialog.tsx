'use client';
import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';
import Modal from './Modal';
import { Avatar } from './ui';
import { useStore } from '@/lib/store';
import { Candidate } from '@/lib/types';
import { cn, emailOf } from '@/lib/utils';
import { toast } from '@/lib/toast';

const STEPS = [
  { icon: ShieldCheck, t: 'Request Kode', d: 'Dapatkan kode unik' },
  { icon: Mail, t: 'Verifikasi', d: 'Masukkan kode' },
  { icon: CheckCircle2, t: 'Vote', d: 'Konfirmasi pilihan' },
];

export default function VoteDialog({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  return (
    <Modal title="Konfirmasi Pemilihan" onClose={onClose}>
      {(close) => <Flow candidate={candidate} close={close} />}
    </Modal>
  );
}

function Flow({ candidate, close }: { candidate: Candidate; close: () => void }) {
  const castVote = useStore((s) => s.castVote);
  const session = useStore((s) => s.session);
  const [step, setStep] = useState(0); // 0 request · 1 verify · 2 confirm · 3 sukses
  const [code, setCode] = useState('');
  const [issuedAt, setIssuedAt] = useState(0);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cool, setCool] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const otpRow = useRef<HTMLDivElement>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const lines = useRef<(HTMLDivElement | null)[]>([]);

  // transisi antar panel
  useEffect(() => {
    if (panel.current) anime({ targets: panel.current, opacity: [0, 1], translateX: [18, 0], duration: 380, easing: 'easeOutCubic' });
    lines.current.forEach((l, i) => l && anime({ targets: l, width: step > i ? '100%' : '0%', duration: 500, easing: 'easeOutExpo' }));
    if (step === 1) setTimeout(() => inputs.current[0]?.focus(), 120);
    if (step === 3) {
      anime({ targets: '#vc-ring', strokeDashoffset: [anime.setDashoffset, 0], duration: 600, easing: 'easeOutQuad' });
      anime({ targets: '#vc-tick', strokeDashoffset: [anime.setDashoffset, 0], duration: 450, delay: 450, easing: 'easeOutQuad' });
      anime({ targets: '.vc-dot', translateX: () => anime.random(-70, 70), translateY: () => anime.random(-70, 70), scale: [1, 0], opacity: [1, 0], duration: 900, delay: 500, easing: 'easeOutExpo' });
    }
  }, [step]);

  // cooldown kirim ulang
  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  const shake = () => anime({ targets: otpRow.current, translateX: [-9, 9, -6, 6, -3, 3, 0], duration: 450, easing: 'easeInOutSine' });

  const sendCode = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    const c = String(100000 + Math.floor(Math.random() * 900000));
    setCode(c); setIssuedAt(Date.now()); setDigits(Array(6).fill('')); setError(''); setAttempts(0); setCool(30);
    setBusy(false); setStep(1);
    toast('Kode unik dikirim ke email Anda', 'info');
  };

  const setDigit = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, '');
    const arr = [...digits];
    if (!d) { arr[i] = ''; setDigits(arr); return; }
    d.slice(0, 6 - i).split('').forEach((ch, k) => { arr[i + k] = ch; });
    setDigits(arr);
    setError('');
    inputs.current[Math.min(i + d.length, 5)]?.focus();
  };

  const verify = () => {
    const entered = digits.join('');
    if (entered.length < 6) { setError('Masukkan 6 digit kode.'); shake(); return; }
    if (Date.now() - issuedAt > 5 * 60 * 1000) { setError('Kode kedaluwarsa. Kirim ulang kode.'); shake(); return; }
    if (entered !== code) {
      const n = attempts + 1;
      setAttempts(n); shake();
      if (n >= 3) { setStep(0); setError('Terlalu banyak percobaan. Minta kode baru.'); return; }
      setError(`Kode salah. Sisa percobaan ${3 - n}.`);
      return;
    }
    setError(''); setStep(2);
  };

  const confirm = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    const res = castVote(candidate.id);
    setBusy(false);
    if (!res.ok) { toast(res.error ?? 'Gagal memberikan suara', 'error'); close(); return; }
    setStep(3);
    toast('Suara Anda berhasil dicatat', 'success');
    setTimeout(close, 2100);
  };

  return (
    <div>
      {/* Stepper */}
      <div className="mb-4 flex items-start">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > i, on = step === i || (step === 3 && i === 2);
          return (
            <div key={s.t} className="flex flex-1 items-start last:flex-none">
              <div className="flex flex-col items-center gap-1 text-center">
                <span className={cn('grid h-8 w-8 place-items-center rounded-full border transition-colors duration-300', done ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : on ? 'border-blue-600 bg-blue-600 text-white' : 'border-zinc-200 text-zinc-400')}>
                  <Icon size={15} />
                </span>
                <span className={cn('text-[11px] font-medium', on || done ? 'text-zinc-900' : 'text-zinc-400')}>{s.t}</span>
                <span className="hidden text-[10px] text-zinc-400 sm:block">{s.d}</span>
              </div>
              {i < 2 && (
                <div className="mx-2 mt-4 h-px flex-1 bg-zinc-200">
                  <div ref={(el) => { lines.current[i] = el; }} className="h-px bg-emerald-500" style={{ width: 0 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kandidat */}
      <div className="mb-4 flex flex-col items-center rounded-xl bg-zinc-50 px-4 py-3 text-center">
        <div className="flex -space-x-3">
          <Avatar src={candidate.ketua.foto} name={candidate.ketua.nama} size={52} />
          <Avatar src={candidate.wakil.foto} name={candidate.wakil.nama} size={52} />
        </div>
        <p className="mt-2 text-sm font-semibold">{candidate.ketua.nama} &amp; {candidate.wakil.nama}</p>
        <p className="text-xs text-zinc-500">Ketua &amp; Wakil Ketua BEM {candidate.jurusan} · {candidate.kampus}</p>
      </div>

      <div ref={panel}>
        {step === 0 && (
          <>
            <div className="mb-4 flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              <p>Untuk keamanan, Anda perlu mendapatkan kode unik yang akan dikirim ke email terdaftar. Kode ini hanya dapat digunakan sekali.</p>
            </div>
            {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
            <button className="btn-primary h-10 w-full" onClick={sendCode} disabled={busy}>
              {busy ? <><Loader2 size={15} className="animate-spin" /> Mengirim…</> : 'Kirim Kode Unik ke Email'}
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="mb-3 text-center text-xs text-zinc-500">Masukkan 6 digit kode yang dikirim ke <b className="text-zinc-700">{session?.nim ? emailOf(session.nim) : 'email Anda'}</b></p>
            <div ref={otpRow} className="mb-3 flex justify-center gap-2">
              {digits.map((d, i) => (
                <input key={i} ref={(el) => { inputs.current[i] = el; }} value={d} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus(); if (e.key === 'Enter') verify(); }}
                  className="h-12 w-10 rounded-lg border border-zinc-200 text-center font-mono text-lg font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-11" />
              ))}
            </div>
            {error && <p className="mb-3 text-center text-xs text-red-600">{error}</p>}

            <div className="mb-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-500">
              <p className="mb-1 font-medium text-zinc-600">Simulasi kotak masuk (demo)</p>
              <p>Kode PemiraUEU Anda: <span className="font-mono text-sm font-semibold tracking-[0.2em] text-zinc-900">{code}</span> · berlaku 5 menit</p>
            </div>

            <div className="flex gap-2">
              <button className="btn-outline h-10" disabled={cool > 0 || busy} onClick={sendCode}>{cool > 0 ? `Kirim ulang ${cool}s` : 'Kirim ulang'}</button>
              <button className="btn-primary h-10 flex-1" onClick={verify}>Verifikasi</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4 text-center text-sm text-zinc-600">Kode terverifikasi. Suara tidak dapat diubah setelah dikirim.</p>
            <button className="btn-primary h-10 w-full" onClick={confirm} disabled={busy}>
              {busy ? <><Loader2 size={15} className="animate-spin" /> Mencatat suara…</> : 'Konfirmasi & Kirim Suara'}
            </button>
          </>
        )}

        {step === 3 && (
          <div className="relative flex flex-col items-center py-4 text-center">
            <div className="relative grid h-20 w-20 place-items-center">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="vc-dot absolute h-1.5 w-1.5 rounded-full" style={{ background: i % 2 ? '#1a5cff' : '#ff5414', opacity: 0 }} />
              ))}
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle id="vc-ring" cx="36" cy="36" r="32" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                <path id="vc-tick" d="M22 37l10 10 18-21" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mt-3 text-base font-semibold">Vote berhasil</h3>
            <p className="mt-1 text-sm text-zinc-500">Suara Anda untuk <b className="text-zinc-800">{candidate.ketua.nama} &amp; {candidate.wakil.nama}</b> telah tercatat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
