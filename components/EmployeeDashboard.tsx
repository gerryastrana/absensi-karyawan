'use client';

import React, { useState } from 'react';
import { Employee, Shift, OfficeLocation, AttendanceRecord } from '@/lib/types';
import { formatIndonesianDate } from '@/lib/utils';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Camera, 
  Calendar, 
  Award,
  FileText,
  Eye,
  ExternalLink
} from 'lucide-react';

interface EmployeeDashboardProps {
  currentUser: Employee;
  todayShift: Shift;
  office: OfficeLocation;
  todayRecord?: AttendanceRecord;
  attendanceHistory: AttendanceRecord[];
  onOpenAttendanceModal: (type: 'clockIn' | 'clockOut') => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  todayShift,
  office,
  todayRecord,
  attendanceHistory,
  onOpenAttendanceModal,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isClockedIn = !!todayRecord?.clockInTime;
  const isClockedOut = !!todayRecord?.clockOutTime;

  // Monthly statistics for current employee
  const myHistory = attendanceHistory.filter((a) => a.employeeId === currentUser.id);
  const totalPresent = myHistory.length;
  const totalLate = myHistory.filter((a) => a.clockInStatus === 'late').length;
  const totalOvertime = myHistory.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Welcome Profile & Shift Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 relative overflow-hidden">
        {/* Subtle background circle decoration */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Halo, {currentUser.name}!
                </h1>
                <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-medium">
                  {currentUser.nik}
                </span>
              </div>
              <p className="text-sky-100 text-sm mt-0.5">
                {currentUser.position} • {currentUser.department}
              </p>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-sky-200">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  Sisa Cuti: <strong className="text-white">{currentUser.leaveBalance} Hari</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                  Kantor: <strong className="text-white truncate max-w-[150px]">{office.name}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Today's Shift Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 md:min-w-[260px]">
            <p className="text-xs uppercase font-semibold text-sky-200 tracking-wider">Jadwal Shift Hari Ini</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                {todayShift.startTime} - {todayShift.endTime}
              </span>
              <span className="text-xs text-sky-200">WIB</span>
            </div>
            <p className="text-xs text-sky-100 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: todayShift.color || '#38bdf8' }} />
              {todayShift.name}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Attendance Action Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Clock In/Out Action Button Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-800">Status Kehadiran Hari Ini</h2>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {formatIndonesianDate(new Date())}
              </span>
            </div>

            {/* Attendance Status Tracker */}
            <div className="grid grid-cols-2 gap-4 my-6">
              
              {/* Clock In Status Box */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isClockedIn 
                  ? 'bg-sky-50/70 border-sky-200' 
                  : 'bg-slate-50 border-slate-200/70'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <LogIn className="w-4 h-4 text-sky-600" /> Jam Masuk
                  </span>
                  {isClockedIn && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      todayRecord.clockInStatus === 'late'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {todayRecord.clockInStatus === 'late'
                        ? `Terlambat (${todayRecord.lateMinutes}m)`
                        : 'Tepat Waktu'}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold font-mono text-slate-800">
                  {isClockedIn ? todayRecord.clockInTime : '--:--:--'}
                </p>
                {isClockedIn && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={todayRecord.clockInPhoto}
                      alt="Selfie Masuk"
                      onClick={() => setSelectedPhoto(todayRecord.clockInPhoto)}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                      title="Klik untuk lihat foto selfie"
                    />
                    <span className="text-[11px] text-slate-500 truncate">
                      {todayRecord.isClockInWithinRadius ? '✓ Dalam Radius' : '⚠ Di Luar Radius'}
                    </span>
                  </div>
                )}
              </div>

              {/* Clock Out Status Box */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isClockedOut 
                  ? 'bg-emerald-50/70 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200/70'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <LogOut className="w-4 h-4 text-emerald-600" /> Jam Pulang
                  </span>
                  {isClockedOut && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {todayRecord?.overtimeHours && todayRecord.overtimeHours > 0
                        ? `Lembur ${todayRecord.overtimeHours} Jam`
                        : 'Selesai'}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold font-mono text-slate-800">
                  {isClockedOut ? todayRecord?.clockOutTime : '--:--:--'}
                </p>
                {isClockedOut && todayRecord?.clockOutPhoto && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={todayRecord.clockOutPhoto}
                      alt="Selfie Pulang"
                      onClick={() => setSelectedPhoto(todayRecord.clockOutPhoto!)}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                      title="Klik untuk lihat foto selfie"
                    />
                    <span className="text-[11px] text-slate-500 truncate">
                      {todayRecord.isClockOutWithinRadius ? '✓ Dalam Radius' : '⚠ Di Luar Radius'}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2">
            {!isClockedIn ? (
              <button
                onClick={() => onOpenAttendanceModal('clockIn')}
                className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-sky-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" />
                Catat Kehadiran Masuk (Clock In)
              </button>
            ) : !isClockedOut ? (
              <button
                onClick={() => onOpenAttendanceModal('clockOut')}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <LogOut className="w-5 h-5" />
                Catat Kehadiran Pulang (Clock Out)
              </button>
            ) : (
              <div className="w-full py-3.5 px-4 bg-slate-100 text-slate-600 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Anda sudah menyelesaikan seluruh absensi untuk hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monthly Quick Stats */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Statistik Bulan Ini
            </h2>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-sky-800 font-medium">Total Hadir</p>
                  <p className="text-xl font-bold text-sky-950 font-mono mt-0.5">{totalPresent} Hari</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-800 font-medium">Terlambat</p>
                  <p className="text-xl font-bold text-rose-950 font-mono mt-0.5">{totalLate} Kali</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
                  !
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-800 font-medium">Total Lembur</p>
                  <p className="text-xl font-bold text-amber-950 font-mono mt-0.5">{totalOvertime} Jam</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  +
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Data otomatis terakumulasi untuk perhitungan slip gaji / KPI bulanan.
          </p>
        </div>

      </div>

      {/* 3. Recent Attendance History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Riwayat Kehadiran Terbaru</h2>
            <p className="text-xs text-slate-500">Log pencatatan GPS dan foto selfie Anda</p>
          </div>
          <span className="text-xs text-slate-400">Total: {myHistory.length} data</span>
        </div>

        {myHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada riwayat kehadiran tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                  <th className="py-3 px-3">Jam Masuk</th>
                  <th className="py-3 px-3">Jam Pulang</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Geofencing</th>
                  <th className="py-3 px-3 rounded-r-xl">Selfie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {formatIndonesianDate(item.date)}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                      {item.clockInTime}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {item.clockOutTime || '-'}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {item.clockInStatus === 'late' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          Terlambat ({item.lateMinutes}m)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Tepat Waktu
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        item.isClockInWithinRadius
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}>
                        <MapPin className="w-3 h-3" />
                        {item.clockInDistanceMeters}m dari kantor
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPhoto(item.clockInPhoto)}
                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90"
            >
              ✕
            </button>
            <img
              src={selectedPhoto}
              alt="Bukti Selfie Absensi"
              className="w-full h-auto object-cover"
            />
            <div className="p-3 text-center text-xs text-slate-300">
              Bukti verifikasi foto selfie real-time saat absensi
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
