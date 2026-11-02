import { Candidate, Jurusan, Kampus, VoteRecord, colorFor } from './types';

export interface Row {
  candidate: Candidate;
  color: string;
  votes: number;
  pct: number;
}

/** 1 vote = 1 poin. Persentase = suara kandidat / total suara masuk × 100. */
export function tally(candidates: Candidate[], votes: VoteRecord[], k: Kampus, j: Jurusan) {
  const cs = candidates
    .filter((c) => c.kampus === k && c.jurusan === j)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const counts = new Map<string, number>();
  for (const v of votes) {
    if (v.kampus === k && v.jurusan === j) counts.set(v.candidateId, (counts.get(v.candidateId) ?? 0) + 1);
  }
  const total = cs.reduce((a, c) => a + (counts.get(c.id) ?? 0), 0);
  const rows: Row[] = cs.map((c, i) => {
    const n = counts.get(c.id) ?? 0;
    return { candidate: c, color: colorFor(i), votes: n, pct: total ? (n / total) * 100 : 0 };
  });
  return { rows, total };
}
