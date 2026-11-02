import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Candidate, Jurusan, Kampus, Session, VoteRecord } from './types';

export const STORE_KEY = 'pemira-ueu-v1';
const DAY = 86400000;

/** Jumlah pemilih terdaftar (DPT) per kampus+jurusan. Demo: deterministik dari nama. */
export function eligibleFor(k: Kampus, j: Jurusan) {
  let h = 0;
  for (const ch of k + j) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 160 + (h % 240);
}

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

function mkCand(
  id: string, kampus: Kampus, jurusan: Jurusan,
  ketua: string, wakil: string, visi: string, misi: string,
): Candidate {
  return { id, kampus, jurusan, ketua: { nama: ketua }, wakil: { nama: wakil }, visi, misi, createdAt: id };
}

function seed() {
  const TI: Jurusan = 'Teknik Informatika';
  const SI: Jurusan = 'Sistem Informasi';
  const candidates: Candidate[] = [
    mkCand('seed-kj-ti-1', 'Kebon Jeruk', TI, 'Ahmad Rizki', 'Sarah Dewi',
      'Menciptakan mahasiswa yang berdaya saing tinggi dan berkarakter',
      '1. Memperkuat kolaborasi riset mahasiswa\n2. Program mentoring bersama alumni industri\n3. Hackathon dan kompetisi rutin tiap semester'),
    mkCand('seed-kj-ti-2', 'Kebon Jeruk', TI, 'Budi Santoso', 'Lisa Permata',
      'Membangun UEU yang inklusif dan berkelanjutan',
      '1. Layanan aspirasi mahasiswa yang terbuka\n2. Kelas berbagi skill lintas angkatan\n3. Transparansi anggaran kegiatan BEM'),
    mkCand('seed-cr-ti-1', 'Citra Raya', TI, 'Rafi Pratama', 'Nadia Kusuma',
      'Kampus Citra Raya yang aktif, kolaboratif, dan terhubung dengan industri',
      '1. Kunjungan industri tiap semester\n2. Komunitas belajar mingguan'),
    mkCand('seed-cr-ti-2', 'Citra Raya', TI, 'Yoga Aditya', 'Intan Maharani',
      'Ekosistem belajar yang suportif untuk semua mahasiswa',
      '1. Peer tutoring gratis\n2. Pekan karier dan portofolio'),
    mkCand('seed-hi-ti-1', 'Harapan Indah', TI, 'Fajar Nugroho', 'Dewi Anggraini',
      'Harapan Indah sebagai pusat inovasi mahasiswa teknologi',
      '1. Lab terbuka untuk proyek mahasiswa\n2. Inkubasi ide startup kampus'),
    mkCand('seed-hi-ti-2', 'Harapan Indah', TI, 'Kevin Wijaya', 'Maya Sari',
      'Menguatkan solidaritas dan prestasi mahasiswa TI',
      '1. Turnamen e-sport dan olahraga\n2. Program beasiswa komunitas'),
    mkCand('seed-kj-si-1', 'Kebon Jeruk', SI, 'David Chen', 'Maya Putri',
      'Digitalisasi penuh untuk kemajuan mahasiswa Sistem Informasi',
      '1. Portal layanan mahasiswa terpadu\n2. Workshop data dan bisnis digital'),
    mkCand('seed-kj-si-2', 'Kebon Jeruk', SI, 'Erik Wijaya', 'Nina Putri',
      'Inovasi teknologi untuk kesejahteraan mahasiswa',
      '1. Kerja sama magang\n2. Forum diskusi bulanan'),
  ];

  const plan: Record<string, number> = {
    'seed-kj-ti-1': 52, 'seed-kj-ti-2': 37,
    'seed-cr-ti-1': 31, 'seed-cr-ti-2': 28,
    'seed-hi-ti-1': 22, 'seed-hi-ti-2': 41,
    'seed-kj-si-1': 18, 'seed-kj-si-2': 24,
  };
  const r = rng(42);
  const now = Date.now();
  const votes: VoteRecord[] = [];
  for (const c of candidates) {
    for (let i = 0; i < (plan[c.id] ?? 0); i++) {
      votes.push({
        id: `${c.id}-v${i}`,
        voterId: `seed-${c.id}-${i}`,
        kampus: c.kampus,
        jurusan: c.jurusan,
        candidateId: c.id,
        at: new Date(now - r() * DAY).toISOString(),
      });
    }
  }
  return { candidates, votes, endsAt: new Date(now + 30 * DAY).toISOString() };
}

interface State {
  session: Session | null;
  candidates: Candidate[];
  votes: VoteRecord[];
  endsAt: string;
  prefs: { notif: boolean; reminder: boolean };

  login: (s: Session) => void;
  logout: () => void;
  updateProfile: (p: Partial<Session>) => void;
  addCandidate: (c: Omit<Candidate, 'id' | 'createdAt'>) => void;
  removeCandidate: (id: string) => string | null;
  castVote: (candidateId: string) => { ok: boolean; error?: string };
  setPref: (k: 'notif' | 'reminder', v: boolean) => void;
  resetDemo: () => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      session: null,
      ...seed(),
      prefs: { notif: true, reminder: true },

      login: (s) => set({ session: s }),
      logout: () => set({ session: null }),
      updateProfile: (p) => set((st) => (st.session ? { session: { ...st.session, ...p } } : st)),

      addCandidate: (c) =>
        set((st) => ({
          candidates: [...st.candidates, { ...c, id: `c-${Date.now()}`, createdAt: new Date().toISOString() }],
        })),

      removeCandidate: (id) => {
        if (get().votes.some((v) => v.candidateId === id)) {
          return 'Kandidat sudah menerima suara, tidak bisa dihapus.';
        }
        set((st) => ({ candidates: st.candidates.filter((c) => c.id !== id) }));
        return null;
      },

      castVote: (candidateId) => {
        const st = get();
        const me = st.session;
        if (!me || me.role !== 'voter' || !me.nim || !me.kampus || !me.jurusan) {
          return { ok: false, error: 'Sesi tidak valid. Silakan masuk lagi.' };
        }
        const c = st.candidates.find((x) => x.id === candidateId);
        if (!c) return { ok: false, error: 'Kandidat tidak ditemukan.' };
        if (c.kampus !== me.kampus || c.jurusan !== me.jurusan) {
          return { ok: false, error: 'Kandidat ini bukan dari kampus dan jurusan Anda.' };
        }
        if (new Date(st.endsAt).getTime() < Date.now()) {
          return { ok: false, error: 'Pemilihan sudah ditutup.' };
        }
        if (st.votes.some((v) => v.voterId === me.nim && v.kampus === me.kampus && v.jurusan === me.jurusan)) {
          return { ok: false, error: 'Anda sudah memberikan suara.' };
        }
        const rec: VoteRecord = {
          id: `v-${Date.now()}`,
          voterId: me.nim,
          kampus: me.kampus,
          jurusan: me.jurusan,
          candidateId,
          at: new Date().toISOString(),
        };
        set({ votes: [...st.votes, rec] });
        return { ok: true };
      },

      setPref: (k, v) => set((st) => ({ prefs: { ...st.prefs, [k]: v } })),
      resetDemo: () => set({ ...seed() }),
    }),
    {
      name: STORE_KEY,
      version: 1,
      skipHydration: true,
    },
  ),
);
