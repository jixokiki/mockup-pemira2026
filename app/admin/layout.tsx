'use client';
import AppShell from '@/components/AppShell';
import { useGuard } from '@/lib/hooks';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = useGuard('admin');
  if (!s) return null;
  return <AppShell role="admin">{children}</AppShell>;
}
