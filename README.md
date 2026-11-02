# PemiraUEU

Next.js 14 (App Router) · Tailwind · anime.js 3.2.2 · zustand

## Jalankan
```bash
npm install
npm run dev        # http://localhost:3000
```

## Akun demo
- Mahasiswa: isi nama, NIM (6–12 digit), pilih kampus + jurusan. Contoh yang sudah ada kandidatnya: **Kebon Jeruk / Teknik Informatika**.
- Admin: ID `admin` · password `admin123`

## Uji real-time
Buka dua tab: tab A login admin (Quick Count), tab B login mahasiswa lalu vote.
Tab A ikut berubah seketika (sinkron lewat localStorage).

## Aturan hitung
1 vote = 1 poin untuk paslon yang dipilih.
Persentase = suara paslon ÷ total suara masuk × 100.
Satu NIM hanya bisa memilih satu kali per pemilihan (kampus + jurusan).
