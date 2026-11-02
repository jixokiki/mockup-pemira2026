export const KAMPUS = ['Kebon Jeruk', 'Citra Raya', 'Harapan Indah'] as const;
export const JURUSAN = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Manajemen',
  'Akuntansi',
  'Hukum',
  'Psikologi',
] as const;

export type Kampus = (typeof KAMPUS)[number];
export type Jurusan = (typeof JURUSAN)[number];

export interface Person {
  nama: string;
  foto?: string;
}

export interface Candidate {
  id: string;
  kampus: Kampus;
  jurusan: Jurusan;
  ketua: Person;
  wakil: Person;
  visi: string;
  misi: string;
  createdAt: string;
}

export interface VoteRecord {
  id: string;
  voterId: string; // NIM
  kampus: Kampus;
  jurusan: Jurusan;
  candidateId: string;
  at: string;
}

export interface Session {
  role: 'voter' | 'admin';
  nama: string;
  nim?: string;
  kampus?: Kampus;
  jurusan?: Jurusan;
  foto?: string;
}

export const CANDIDATE_COLORS = ['#1a5cff', '#ff5414', '#10b981', '#f59e0b', '#e11d48', '#0891b2'];
export const colorFor = (i: number) => CANDIDATE_COLORS[i % CANDIDATE_COLORS.length];
