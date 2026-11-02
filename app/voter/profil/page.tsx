'use client';
import { useRef, useState } from 'react';
import { CheckCircle2, Save, Upload } from 'lucide-react';
import { useEnter } from '@/lib/anim';
import { useStore } from '@/lib/store';
import { resizeImage } from '@/lib/image';
import { emailOf, fmtDate } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { Avatar } from '@/components/ui';
import { Session } from '@/lib/types';

export default function Page() {
  const me = useStore((s) => s.session) as Session;
  const update = useStore((s) => s.updateProfile);
  const votes = useStore((s) => s.votes);
  const candidates = useStore((s) => s.candidates);
  const [nama, setNama] = useState(me.nama);
  const file = useRef<HTMLInputElement>(null);
  const ref = useEnter<HTMLDivElement>();

  const history = votes.filter((v) => v.voterId === me.nim).sort((a, b) => b.at.localeCompare(a.at));

  const onFile = async (f?: File) => {
    if (!f) return;
    try { update({ foto: await resizeImage(f) }); toast('Foto profil diperbarui'); } catch { toast('Gagal membaca gambar', 'error'); }
  };

  return (
    <div ref={ref} className="space-y-5">
      <h1 data-anim className="text-lg font-semibold tracking-tight">Profil Saya</h1>
      <div className="grid gap-5 md:grid-cols-[280px_1fr]">
        <section data-anim className="card flex flex-col items-center p-6 text-center">
          <Avatar src={me.foto} name={me.nama} size={96} />
          <button className="btn-outline mt-3 h-8 text-xs" onClick={() => file.current?.click()}><Upload size={13} /> Ubah Foto Profil</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <p className="mt-4 text-sm font-semibold">{me.nama}</p>
          <p className="break-all text-[11px] text-zinc-500">{emailOf(me.nim!)}</p>
        </section>

        <section data-anim className="card p-5">
          <h2 className="mb-4 text-sm font-semibold">Informasi Pribadi</h2>
          <div className="space-y-4">
            <div><label className="label">Nama Lengkap</label><input className="input" value={nama} onChange={(e) => setNama(e.target.value)} /></div>
            <div><label className="label">Email</label><input className="input" value={emailOf(me.nim!)} disabled /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="label">NIM</label><input className="input" value={me.nim} disabled /></div>
              <div><label className="label">Kampus</label><input className="input" value={me.kampus} disabled /></div>
              <div><label className="label">Jurusan</label><input className="input" value={me.jurusan} disabled /></div>
            </div>
            <p className="text-[11px] text-zinc-400">Kampus dan jurusan dikunci agar hak pilih tidak dapat berpindah ke jurusan lain.</p>
            <button className="btn-primary" onClick={() => { if (nama.trim().length < 3) return toast('Nama minimal 3 karakter', 'error'); update({ nama: nama.trim() }); toast('Perubahan disimpan'); }}><Save size={15} /> Simpan Perubahan</button>
          </div>
        </section>
      </div>

      <section data-anim className="card">
        <div className="border-b border-zinc-100 px-5 py-4"><h2 className="text-sm font-semibold">Riwayat Pemilihan</h2></div>
        {history.length === 0 && <p className="px-5 py-8 text-center text-sm text-zinc-400">Belum ada riwayat pemilihan.</p>}
        {history.map((v) => {
          const c = candidates.find((x) => x.id === v.candidateId);
          return (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 py-3.5 last:border-0">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={16} /></span>
                <div><p className="text-sm font-medium">Pemilihan BEM {v.jurusan} 2026</p><p className="text-xs text-zinc-500">Memilih pada {fmtDate(v.at)}</p></div>
              </div>
              <span className="badge-zinc">Pilihan: {c?.ketua.nama} &amp; {c?.wakil.nama}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
