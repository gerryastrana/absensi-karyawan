# PresensiKu - Sistem Aplikasi Web Absensi Karyawan (Production Ready)

Sistem absensi karyawan berbasis web (*Progressive Web App / PWA*) modern, siap digunakan secara langsung oleh karyawan dan divisi HR di lingkungan produksi (*production*).

---

## 🔒 Keamanan & Akun Akses Produksi

Seluruh jalan pintas demo (*demo bypass*) telah dihapus. Setiap pengguna (karyawan maupun HR) wajib melakukan autentikasi menggunakan **Email atau NIK** serta **Password** masing-masing.

### Akun Awal Administrator (HR):
- **Email:** `siti.rahma@perusahaan.com` (atau NIK: `KRY-2024-002`)
- **Password:** `admin123`
- *Disarankan:* Setelah login pertama kali, HR dapat memperbarui password atau mendaftarkan akun karyawan baru melalui menu **"Kelola Karyawan"**.

### Contoh Akun Karyawan:
- **Email:** `budi.santoso@perusahaan.com` (atau NIK: `KRY-2024-001`)
- **Password:** `karyawan123`

---

## 🗄️ Database Cloud Gratis di Vercel (Penyimpanan Permanen)

Saat di-hosting di **Vercel**, server Next.js bersifat *Serverless* (tidak menyimpan file database lokal secara permanen). Agar data absensi yang dicatat karyawan di HP langsung tersimpan secara terpusat dan dapat dilihat oleh HR di komputer lain, kita menghubungkannya ke **Supabase** (layanan Cloud PostgreSQL resmi yang **100% GRATIS**).

### Langkah Menghubungkan Supabase (Hanya 3 Menit):

1. **Buat Akun & Proyek di Supabase:**
   - Kunjungi [supabase.com](https://supabase.com) lalu daftar / login gratis (bisa menggunakan akun GitHub Anda).
   - Klik **"New Project"**, beri nama proyek (misal: `absensi-karyawan`), tentukan database password, lalu pilih wilayah server terdekat (contoh: *Singapore*).

2. **Buat Tabel Otomatis:**
   - Di dashboard Supabase, buka menu **"SQL Editor"** di bilah sisi kiri.
   - Buka file [database.sql](file:///h:/My%20Drive/webproject/absensi-karyawan/database.sql) yang sudah kami sediakan di proyek ini, copy seluruh kodenya, dan paste ke dalam SQL Editor Supabase.
   - Klik tombol **"Run"**. Seluruh tabel (Karyawan, Absensi, Cuti, Shift, Kantor) dan izin akses (RLS) akan otomatis terkonfigurasi.

3. **Hubungkan Kunci API ke Proyek:**
   - Di dashboard Supabase, buka menu **Project Settings (ikon Gerigi)** -> **API**.
   - Salin dua nilai berikut:
     - **Project URL**
     - **Project API Key (`anon` / `public`)**
   - **Untuk Komputer Lokal (Localhost):**
     - Buat file `.env.local` di folder utama aplikasi.
     - Masukkan kredensial Anda:
       ```env
       NEXT_PUBLIC_SUPABASE_URL=https://[id-proyek].supabase.co
       NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
       ```
     - Restart terminal development (`npm run dev`). Di bilah navigasi atas akan muncul status hijau **"Supabase"**.
   - **Untuk Hosting di Vercel:**
     - Masuk ke dashboard proyek Vercel ➔ **Settings** ➔ **Environment Variables**.
     - Tambahkan kedua variabel di atas lalu lakukan *Redeploy*.

Sekarang setiap ada karyawan yang absen masuk/pulang, datanya langsung tersimpan permanen di cloud dan bisa dipantau langsung dari dashboard HR maupun dari web Supabase!

---

## 🌟 Fitur Siap Pakai

1. **Autentikasi & Proteksi Akses**
   - Halaman login resmi yang bersih tanpa tombol bypass.
   - Hak akses berjenjang (Karyawan vs HR Admin).
   - Profil pengguna mandiri dengan tombol Logout aman pada bilah navigasi.

2. **Pencatatan Kehadiran (Clock In / Clock Out)**
   - Akses via browser HP atau desktop tanpa mesin fingerprint fisik.
   - Otomatis mencatat waktu kehadiran, toleransi keterlambatan (*grace period*), dan jam lembur (*overtime*).

3. **Geolocation & Geofencing Akurat**
   - Mendeteksi titik koordinat GPS real-time karyawan dan menghitung jarak akurat ke kantor dengan rumus *Haversine*.
   - Validasi Geofencing: Menandai apakah presensi dilakukan di dalam radius kantor atau di luar area kerja.
   - Titik kantor dan radius toleransi (meter) dikonfigurasi langsung oleh HR.

4. **Verifikasi Selfie Kamera Langsung (Anti Titip Absen)**
   - Wajib mengambil foto wajah secara langsung *real-time* melalui kamera.
   - Tombol konfirmasi absensi terkunci sampai karyawan selesai mengambil foto selfie.
   - Watermark otomatis nama pegawai, tanggal, dan jam presensi tercetak pada foto.

5. **Manajemen Cuti & Izin Kerja**
   - Pengajuan mandiri: Cuti Tahunan, Sakit (unggah surat dokter), Izin Pribadi, atau Tugas Luar.
   - Alur persetujuan (*approval*) langsung oleh atasan/HR dengan catatan peninjauan dan pemotongan otomatis kuota cuti.

6. **Pengaturan Jadwal Kerja & Shift Operasional**
   - Pengelolaan master shift (Pagi, Siang, Malam, Reguler).
   - Penugasan shift kerja ke masing-masing karyawan secara terpusat.

7. **Laporan & Ekspor Otomatis**
   - Dasbor statistik kehadiran harian/bulanan.
   - **Download Excel (.xlsx)**: Rekap lengkap seluruh log kehadiran beserta bukti selfie dan jarak GPS.
   - **Cetak / PDF**: Laporan resmi siap cetak dengan kop kantor.

---

## 🚀 Panduan Deployment ke Server / Hosting

### Pilihan 1: Hosting Gratis di Vercel (Paling Direkomendasikan)
1. Buat repositori baru di [GitHub](https://github.com) (misalnya: `presensiku`).
2. Jalankan perintah di folder proyek:
   ```bash
   git init
   git add .
   git commit -m "Siap produksi: PresensiKu Web Absensi"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/presensiku.git
   git push -u origin main
   ```
3. Buka [vercel.com](https://vercel.com), klik **"Add New..."** -> **"Project"**.
4. Pilih repositori `presensiku` dan klik **"Deploy"**.
5. Masukkan variabel environment Supabase (jika ingin tersambung ke cloud database) di menu *Settings* -> *Environment Variables*.

---

### Pilihan 2: Deployment Menggunakan Docker (VPS / Cloud)
Proyek ini sudah dilengkapi dengan berkas `Dockerfile` multi-stage siap pakai:

1. Build image Docker:
   ```bash
   docker build -t presensiku:latest .
   ```
2. Jalankan container:
   ```bash
   docker run -d -p 3000:3000 --name presensi-app presensiku:latest
   ```
3. Akses melalui IP server / domain Anda: `http://IP-SERVER:3000`.

---

## 📱 Panduan Pemasangan di Layar Utama HP Karyawan (PWA)
Aplikasi dapat dibuka dan diinstal seperti aplikasi native di HP:
1. Buka tautan absensi di Google Chrome (Android) atau Safari (iOS).
2. Ketuk ikon menu (titik tiga di Android atau tombol Share di Safari).
3. Pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
4. Ikon aplikasi *PresensiKu* akan muncul di layar ponsel dan siap digunakan untuk absensi harian.
