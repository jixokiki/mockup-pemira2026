'use client';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { eligibleFor, useStore } from './store';
import { tally } from './selectors';
import { Session } from './types';
import { daysLeft } from './utils';

/** Redirect ke login kalau belum masuk / role tidak cocok. */
export function useGuard(role: 'voter' | 'admin') {
  const session = useStore((s) => s.session);
  const router = useRouter();
  useEffect(() => {
    if (!session || session.role !== role) router.replace('/');
  }, [session, role, router]);
  return session && session.role === role ? session : null;
}

/** Data pemilihan milik voter yang sedang login (hanya kampus + jurusannya). */
export function useMyElection() {
  const me = useStore((s) => s.session) as Session;
  const candidates = useStore((s) => s.candidates);
  const votes = useStore((s) => s.votes);
  const endsAt = useStore((s) => s.endsAt);
  const k = me.kampus!;
  const j = me.jurusan!;
  const { rows, total } = useMemo(() => tally(candidates, votes, k, j), [candidates, votes, k, j]);
  const myVote = votes.find((v) => v.voterId === me.nim && v.kampus === k && v.jurusan === j);
  const eligible = eligibleFor(k, j);
  return {
    me, k, j, rows, total, eligible, endsAt,
    votes: useMemo(() => votes.filter((v) => v.kampus === k && v.jurusan === j), [votes, k, j]),
    myVote,
    voted: !!myVote,
    open: new Date(endsAt).getTime() > Date.now(),
    days: daysLeft(endsAt),
    participation: eligible ? (total / eligible) * 100 : 0,
    name: `Pemilihan BEM ${j} 2026`,
  };
}
