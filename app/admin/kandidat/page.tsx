'use client';
import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useEnter } from '@/lib/anim';
import { useStore } from '@/lib/store';
import { tally } from '@/lib/selectors';
import { JURUSAN, KAMPUS, Jurusan, Kampus, colorFor } from '@/lib/types';
import { toast } from '@/lib/toast';
import CandidateCard from '@/components/CandidateCard';
import PhotoField from '@/components/PhotoField';
import Modal from '@/components/Modal';
import { Avatar } from '@/components/ui';

export default function Page() {
  const candidates = useStore((s) => s.candidates);
  const votes = useStore((s) => s.votes);
  const add = useStore((s) => s.addCandidate);
  const remove = useStore((s) => s.removeCandidate);
  const ref = useEnter<HTMLDivElement>();

  const [kampus, setKampus] = useState<Kampus>(KAMPUS[0]);
  const [jurusan, setJurusan] = useState<Jurusan>(JURUSAN[0]);
  const [ketua, setKetua] = useState('');
  const [fotoKetua, setFotoKetua] = useState<string>();
  const [wakil, setWakil] = useState('');
  const [fotoWakil, setFotoWakil] = useState<string>();
  const [visi, setVisi] = useState('');
  const [misi, setMisi] = useState('');
  const [del, setDel] = useState<string | null>(null);

  const { rows } = useMemo(() => tally(candidates, votes, kampus, jurusan), [candidates, votes, kampus, jurusan]);
  const nextColor = colorFor(rows.length);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ketua.trim().length < 3 || wakil.trim().length < 3) return toast('Nama ketua dan wakil wajib diisi', 'error');
    if (visi.trim().length < 10) return toast('Visi minimal 10 karakter', 'error');
    add({ kampus, jurusan, ketua: { nama: ketua.trim(), foto: fotoKetua }, wakil: { nama: wakil.trim(), foto: fotoWakil }, visi: visi.trim(), misi: misi.trim() });
    toast('Paslon ditambahkan. Langsung tampil di dashboard mahasiswa.');
    setKetua(''); setWakil(''); setFotoKetua(undefined); setFotoWakil(undefined); setVisi(''); setMisi('');
  };

  const preview = { id: 'preview', kampus, jurusan, ketua: { nama: ketua || 'Nama Ketua', foto: fotoKetua }, wakil: { nama: wakil || 'Nama Wakil', foto: fotoWakil }, visi: visi || 'Visi paslon akan tampil di sini.', misi, createdAt: '' };
  const delTarget = candidates.find((c) => c.id === del);

  return (
    <div ref={ref} className="space-y-5">
      <section data-anim className="card p-5">
        <h1 className="text-lg font-semibold tracking-tight">Input Kandidat</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Paslon yang Anda tambahkan hanya tampil untuk mahasiswa di kampus dan jurusan yang dipilih.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div><label className="label">Kampus</label><select className="input" value={kampus} onChange={(e) => setKampus(e.target.value as Kampus)}>{KAMPUS.map((k) => <option key={k}>{k}</option>)}</select></div>
          <div><label className="label">Jurusan</label><select className="input" value={jurusan} onChange={(e) => setJurusan(e.target.value as Jurusan)}>{JURUSAN.map((j) => <option key={j}>{j}</option>)}</select></div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <form data-anim onSubmit={submit} className="card space-y-5 p-5">
          <div className="space-y-3 rounded-xl bg-blue-50/60 p-4">
            <p className="text-xs font-semibold text-blue-700">Calon Ketua</p>
            <div><label className="label">Nama ketua</label><input className="input bg-white" value={ketua} onChange={(e) => setKetua(e.target.value)} placeholder="Nama lengkap" /></div>
            <PhotoField label="Foto ketua" name={ketua} value={fotoKetua} onChange={setFotoKetua} />
          </div>
          <div className="space-y-3 rounded-xl bg-orange-50/60 p-4">
            <p className="text-xs font-semibold text-orange-700">Calon Wakil Ketua</p>
            <div><label className="label">Nama wakil ketua</label><input className="input bg-white" value={wakil} onChange={(e) => setWakil(e.target.value)} placeholder="Nama lengkap" /></div>
            <PhotoField label="Foto wakil ketua" name={wakil} value={fotoWakil} onChange={setFotoWakil} />
          </div>
          <div><label className="label">Visi</label><textarea className="input" value={visi} onChange={(e) => setVisi(e.target.value)} placeholder="Satu kalimat visi paslon" /></div>
          <div><label className="label">Misi <span className="font-normal text-zinc-400">(satu baris per poin)</span></label><textarea className="input min-h-[120px]" value={misi} onChange={(e) => setMisi(e.target.value)} placeholder={'Memperkuat kolaborasi\nMembuka kanal aspirasi'} /></div>
          <button className="btn-primary h-10 w-full sm:w-auto"><Plus size={15} /> Tambah Paslon</button>
        </form>

        <aside data-anim className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">Pratinjau (tampilan mahasiswa)</p>
            <CandidateCard c={preview} color={nextColor} footer={<button disabled className="btn-primary h-10 w-full">Pilih Kandidat</button>} />
          </div>
          <div className="card">
            <div className="border-b border-zinc-100 px-4 py-3"><h2 className="text-sm font-semibold">Terdaftar ({rows.length})</h2><p className="text-[11px] text-zinc-400">{jurusan} · {kampus}</p></div>
            {rows.length === 0 && <p className="px-4 py-6 text-center text-xs text-zinc-400">Belum ada paslon.</p>}
            {rows.map((r) => (
              <div key={r.candidate.id} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-0">
                <span className="flex -space-x-2"><Avatar src={r.candidate.ketua.foto} name={r.candidate.ketua.nama} size={30} /><Avatar src={r.candidate.wakil.foto} name={r.candidate.wakil.nama} size={30} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{r.candidate.ketua.nama} &amp; {r.candidate.wakil.nama}</p><p className="text-[11px] text-zinc-400">{r.votes} suara</p></div>
                <button aria-label="Hapus paslon" onClick={() => setDel(r.candidate.id)} className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {delTarget && (
        <Modal title="Hapus paslon?" onClose={() => setDel(null)}>
          {(close) => (
            <>
              <p className="text-sm text-zinc-600">{delTarget.ketua.nama} &amp; {delTarget.wakil.nama} akan dihapus dari daftar pemilihan {delTarget.jurusan} ({delTarget.kampus}).</p>
              <div className="mt-5 flex justify-end gap-2">
                <button className="btn-outline" onClick={close}>Batal</button>
                <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={() => { const err = remove(delTarget.id); toast(err ?? 'Paslon dihapus', err ? 'error' : 'success'); close(); }}>Hapus</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
