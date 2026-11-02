'use client';
import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Avatar } from './ui';
import { resizeImage } from '@/lib/image';
import { toast } from '@/lib/toast';

export default function PhotoField({ label, name, value, onChange }: { label: string; name: string; value?: string; onChange: (v?: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <Avatar src={value} name={name} size={52} />
        <button type="button" className="btn-outline h-8 text-xs" onClick={() => input.current?.click()}><ImagePlus size={14} /> {value ? 'Ganti foto' : 'Unggah foto'}</button>
        {value && <button type="button" aria-label="Hapus foto" className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" onClick={() => onChange(undefined)}><X size={14} /></button>}
        <input ref={input} hidden type="file" accept="image/*" onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          try { onChange(await resizeImage(f)); } catch { toast('Gagal membaca gambar', 'error'); }
        }} />
      </div>
    </div>
  );
}
