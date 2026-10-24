import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'PresensiKu - Aplikasi Web Absensi Karyawan GPS & Kamera Wajah',
  description: 'Sistem absensi online berbasis web dengan validasi Geolocation, Geofencing, Verifikasi Selfie, Manajemen Shift, Cuti, dan Laporan Rekapitulasi.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0284c7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
