'use client';

import React, { useState } from 'react';
import { OfficeLocation } from '@/lib/types';
import { 
  MapPin, 
  Save, 
  Crosshair, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle 
} from 'lucide-react';

interface OfficeSettingsProps {
  office: OfficeLocation;
  onSaveOffice: (updated: OfficeLocation) => void;
}

export const OfficeSettings: React.FC<OfficeSettingsProps> = ({
  office,
  onSaveOffice,
}) => {
  const [name, setName] = useState(office.name);
  const [address, setAddress] = useState(office.address);
  const [latitude, setLatitude] = useState(office.latitude);
  const [longitude, setLongitude] = useState(office.longitude);
  const [radiusMeters, setRadiusMeters] = useState(office.radiusMeters);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Peramban tidak mendukung GPS / Geolocation.');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        alert('Gagal mengambil titik GPS. Pastikan izin akses lokasi peramban diizinkan.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveOffice({
      ...office,
      name,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radiusMeters),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Pengaturan Lokasi Kantor & Geofencing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Konfigurasi titik koordinat GPS kantor utama / cabang dan batas radius toleransi absensi karyawan.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            Pengaturan titik koordinat dan radius geofence berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kantor / Cabang
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kantor Pusat..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Radius Toleransi Geofencing (Meter)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required
                />
                <span className="text-xs font-semibold text-slate-600">Meter</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Karyawan harus berada maksimal {radiusMeters} meter dari titik kantor untuk dianggap valid.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Kantor
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              required
            />
          </div>

          {/* GPS Coordinates & Quick Fetch */}
          <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                Titik Koordinat GPS (Latitude & Longitude)
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingGps}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isGettingGps ? 'animate-spin' : ''}`} />
                {isGettingGps ? 'Membaca GPS...' : 'Gunakan Koordinat GPS Saya Sekarang'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-sky-800 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-sky-800 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-sky-700">
              💡 <em>Petunjuk:</em> Klik tombol <strong>"Gunakan Koordinat GPS Saya Sekarang"</strong> jika Anda sedang berada di area kantor untuk menetapkan koordinat kantor secara otomatis sesuai titik GPS saat ini.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-sky-600/25 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan Lokasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
