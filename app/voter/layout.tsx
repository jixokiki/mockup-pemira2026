'use client';
import AppShell from '@/components/AppShell';
import { useGuard } from '@/lib/hooks';

export default function VoterLayout({ children }: { children: React.ReactNode }) {
  const s = useGuard('voter');
  if (!s) return null;
  return <AppShell role="voter">{children}</AppShell>;
}
