# PresensiKu - Aplikasi Web Absensi Karyawan (GPS, Selfie, Shift & Cuti)

Aplikasi absensi karyawan berbasis web modern, responsif (tampilan mobile-first layaknya aplikasi native), ramah pemula, dan siap di-hosting secara **100% GRATIS** di cloud.

---

## 🔑 Akun Login Default & Akses Demo

Aplikasi dilengkapi halaman login resmi serta fitur **1-Click Demo Login** untuk mempermudah pengujian:

| Role | Email / NIK | Password Default | Hak Akses |
|---|---|---|---|
| **HR / Admin** | `siti.rahma@perusahaan.com` atau `KRY-2024-002` | `admin123` | **Akses Penuh**: Kelola Karyawan, Approval Cuti, Atur Shift, Lokasi Geofence, Rekap Laporan & Absensi |
| **Karyawan** | `budi.santoso@perusahaan.com` atau `KRY-2024-001` | `karyawan123` | **Akses Karyawan**: Absen Masuk & Pulang (GPS + Selfie), Riwayat Presensi, Ajukan Cuti/Izin |

---

## 🌟 Fitur Lengkap Aplikasi

1. **Halaman Autentikasi & Login Modern**
   - Mendukung login menggunakan **Email** maupun **Nomor Induk Karyawan (NIK)**.
   - Pilihan cepat **1-Click Demo Login** untuk langsung masuk sebagai Admin atau Karyawan tanpa perlu mengetik.
   - Fitur Show/Hide Password dan tombol Logout resmi pada bilah navigasi.

2. **Manajemen User Karyawan (Khusus HR Admin)**
   - **Tambah Karyawan Baru**: Input NIK, Nama, Email, Password login, Departemen, Jabatan, Role (Admin/Karyawan), Shift default, Saldo cuti tahunan, No HP, dan Foto profil avatar.
   - **Edit & Perbarui Data**: Mengubah profil, divisi, dan penugasan shift kerja.
   - **Reset Password**: HR Admin dapat langsung mereset password akun karyawan yang lupa kata sandi.
   - **Pencarian & Filter Cepat**: Filter karyawan berdasarkan Departemen dan Role, serta kotak pencarian instan (nama/NIK/email).
   - **Hapus Data Karyawan**: Dilengkapi proteksi keamanan agar admin tidak dapat menghapus akunnya sendiri yang sedang aktif.

3. **Pencatatan Kehadiran (Clock In / Clock Out)**
   - Karyawan dapat langsung melakukan absensi masuk dan pulang melalui browser (Google Chrome, Safari, Edge) di HP maupun laptop tanpa perlu mesin fingerprint fisik.
   - Status kehadiran otomatis: *Tepat Waktu*, *Terlambat (X menit)*, *Pulang Cepat*, atau *Lembur (X jam)*.

4. **Pelacakan Lokasi (Geolocation & Geofencing)**
   - Mendeteksi titik koordinat GPS real-time karyawan secara akurat.
   - Perhitungan jarak otomatis dengan rumus **Haversine Formula** terhadap titik kantor pusat/cabang.
   - Validasi Geofencing: Status hijau (*Dalam Radius Kantor*) atau peringatan merah (*Di Luar Radius Kantor*) sesuai batas toleransi meter yang ditentukan oleh HR.
   - Tombol cepat untuk HR: *"Gunakan Koordinat GPS Saya Sekarang"* untuk kemudahan uji coba.

5. **Verifikasi Selfie (Real-time Live Camera)**
   - Mewajibkan karyawan mengambil foto selfie langsung via kamera web/HP pada saat absensi.
   - Menangkal kecurangan dan titip absen karena tidak memperbolehkan upload foto lama dari galeri.
   - Dilengkapi *viewfinder* panduan wajah dan watermark otomatis (Nama Pegawai, Jam, Tanggal).

6. **Manajemen Cuti dan Izin**
   - Karyawan dapat mengajukan *Cuti Tahunan*, *Izin Pribadi*, *Sakit*, maupun *Dinas Luar*.
   - Dilengkapi upload lampiran surat dokter / berkas pendukung (PDF/JPG/PNG).
   - Alur persetujuan (*Approval Workflow*) langsung oleh Atasan / HR Manager dengan catatan review.
   - Pengurangan otomatis saldo kuota cuti tahunan jika pengajuan disetujui.

7. **Pengaturan Jadwal dan Shift**
   - Master Shift: HR dapat membuat berbagai jadwal kerja (Shift Pagi, Shift Siang, Shift Malam, Shift Reguler).
   - Pengaturan jam masuk, jam pulang, dan batas toleransi keterlambatan (*grace period*).
   - Roster / Distribusi penugasan shift ke masing-masing karyawan secara terpusat.

8. **Laporan Kehadiran Otomatis & Ekspor**
   - Dasbor KPI rekapitulasi kehadiran harian/bulanan.
   - Filter berdasarkan departemen, rentang tanggal, dan status presensi.
   - **Download Excel (.xlsx)**: File spreadsheet rapi siap olah untuk evaluasi kinerja dan penggajian (*payroll*).
   - **Cetak / PDF**: Tampilan cetak resmi siap simpan ke format PDF dengan kop surat kantor.

---

## 🚀 Cara Menjalankan di Komputer Lokal

1. Buka terminal (PowerShell atau Command Prompt) di folder proyek ini:
   ```powershell
   cd "c:\Users\user\Documents\analisa kredit"
   ```
2. Jalankan perintah:
   ```powershell
   npm run dev
   ```
3. Buka peramban (browser) dan akses:
   ```text
   http://localhost:3000
   ```
4. Di halaman login, Anda dapat mengetikkan email/password atau cukup klik tombol **"HR Admin"** / **"Karyawan"** pada bagian *1-Click Demo*.
5. Izinkan akses **Kamera** dan **Lokasi (GPS)** pada peramban saat melakukan absensi.

---

## 🌐 Panduan Hosting Gratis (Paling Mudah & Murah)

Aplikasi ini menggunakan **Next.js**, yang dirancang khusus untuk dapat di-hosting secara **100% GRATIS** di **Vercel** (penyedia hosting cloud resmi pembuat Next.js).

### Mengapa Vercel?
- ✅ **Gratis Selamanya** untuk penggunaan pribadi & UKM/kantor.
- ✅ **Otomatis HTTPS / SSL Gratis**: Ini **sangat penting**, karena browser modern (Chrome di Android & Safari di iOS) hanya mengizinkan akses Kamera & GPS jika situs berstatus HTTPS aman!
- ✅ Performa sangat cepat dengan CDN global.

### Langkah-langkah Deploy ke Vercel (Hanya 3 Menit):

1. Buat repositori baru di akun [GitHub](https://github.com) Anda (misalnya: `absensi-karyawan`).
2. Upload/push folder proyek ini ke repositori GitHub tersebut:
   ```bash
   git init
   git add .
   git commit -m "Upload sistem absensi karyawan lengkap"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/absensi-karyawan.git
   git push -u origin main
   ```
3. Buka situs [Vercel](https://vercel.com) dan login menggunakan akun GitHub Anda.
4. Klik tombol **"Add New..."** -> **"Project"**.
5. Pilih repositori `absensi-karyawan` yang baru Anda buat, lalu klik **"Deploy"**.
6. Selesai! Dalam hitungan detik, aplikasi Anda sudah online dengan tautan seperti:
   `https://absensi-karyawan.vercel.app`
   Tautan ini dapat langsung dibagikan ke seluruh karyawan untuk digunakan di HP mereka!

---

## 📱 Tips Penggunaan pada Smartphone (PWA)
Karyawan dapat memasang aplikasi ini di layar utama HP layaknya aplikasi Play Store / App Store:
1. Buka tautan web di peramban Google Chrome (Android) atau Safari (iOS).
2. Tekan menu **Titik Tiga** (di Chrome) atau tombol **Share** (di Safari).
3. Pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
4. Ikon aplikasi *PresensiKu* akan muncul di layar ponsel dan dapat dibuka langsung dalam mode layar penuh (*full screen*).
