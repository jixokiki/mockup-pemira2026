'use client';
import { useEffect, useState } from 'react';
import { STORE_KEY, useStore } from '@/lib/store';
import Toaster from './Toaster';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate manual agar tidak mismatch dengan SSR
    Promise.resolve(useStore.persist.rehydrate()).then(() => setReady(true));
    // Sinkron antar-tab: voter vote di tab A -> quick count admin di tab B ikut berubah
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORE_KEY) useStore.persist.rehydrate();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <>
      {ready ? children : <div className="grid min-h-dvh place-items-center text-sm text-zinc-400">Memuat…</div>}
      <Toaster />
    </>
  );
}
