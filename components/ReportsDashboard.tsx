'use client';

import React, { useState } from 'react';
import { AttendanceRecord, Employee, OfficeLocation } from '@/lib/types';
import { formatIndonesianDate } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Printer, 
  Filter, 
  Download, 
  Users, 
  Clock, 
  AlertTriangle, 
  Calendar,
  CheckCircle,
  Eye,
  Search
} from 'lucide-react';

interface ReportsDashboardProps {
  attendances: AttendanceRecord[];
  employees: Employee[];
  office: OfficeLocation;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  attendances,
  employees,
  office,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Departments list
  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))];

  // Filter records
  const filteredRecords = attendances.filter((rec) => {
    // Dept filter
    if (selectedDept !== 'all' && rec.department !== selectedDept) {
      return false;
    }
    // Status filter
    if (selectedStatus === 'ontime' && rec.clockInStatus !== 'ontime') return false;
    if (selectedStatus === 'late' && rec.clockInStatus !== 'late') return false;
    if (selectedStatus === 'outside' && rec.isClockInWithinRadius) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.employeeName.toLowerCase().includes(q);
      const matchDept = rec.department.toLowerCase().includes(q);
      if (!matchName && !matchDept) return false;
    }
    return true;
  });

  // KPI calculations
  const totalRecords = filteredRecords.length;
  const totalLate = filteredRecords.filter((r) => r.clockInStatus === 'late').length;
  const totalOntime = filteredRecords.filter((r) => r.clockInStatus === 'ontime').length;
  const totalOvertimeHours = filteredRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);

  // Export to Excel handler
  const handleExportExcel = () => {
    const dataToExport = filteredRecords.map((r, index) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      return {
        No: index + 1,
        Tanggal: r.date,
        NIK: emp?.nik || '-',
        'Nama Karyawan': r.employeeName,
        Departemen: r.department,
        'Jam Masuk': r.clockInTime,
        'Status Masuk': r.clockInStatus === 'late' ? `Terlambat (${r.lateMinutes}m)` : 'Tepat Waktu',
        'Jam Pulang': r.clockOutTime || 'Belum Pulang',
        'Lembur (Jam)': r.overtimeHours || 0,
        'Jarak GPS (Meter)': r.clockInDistanceMeters,
        'Validasi Radius': r.isClockInWithinRadius ? 'Dalam Radius' : 'Di Luar Radius',
        'Catatan / Lokasi': r.clockInAddress || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');

    // Auto-fit column width
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 12 }, // Tanggal
      { wch: 15 }, // NIK
      { wch: 22 }, // Nama
      { wch: 22 }, // Dept
      { wch: 12 }, // Masuk
      { wch: 18 }, // Status
      { wch: 14 }, // Pulang
      { wch: 14 }, // Lembur
      { wch: 18 }, // Jarak
      { wch: 16 }, // Radius
      { wch: 30 }, // Catatan
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Rekap_Absensi_Karyawan_${todayStr}.xlsx`);
  };

  // Print PDF handler
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Laporan & Rekapitulasi Kehadiran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dasbor rekapitulasi kehadiran, keterlambatan, lembur, dan ekspor instan ke Excel / PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/25 transition active:scale-95"
            title="Download file Microsoft Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel (.xlsx)
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-slate-900/25 transition active:scale-95"
            title="Cetak atau Simpan PDF"
          >
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-600" /> Total Presensi
          </span>
          <p className="text-2xl font-bold text-slate-800 font-mono mt-1">{totalRecords}</p>
          <span className="text-[11px] text-slate-400">Pencatatan tercatat</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Tepat Waktu
          </span>
          <p className="text-2xl font-bold text-emerald-800 font-mono mt-1">{totalOntime}</p>
          <span className="text-[11px] text-emerald-600">Presensi on-time</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Terlambat
          </span>
          <p className="text-2xl font-bold text-rose-800 font-mono mt-1">{totalLate}</p>
          <span className="text-[11px] text-rose-600">Melewati toleransi</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" /> Total Jam Lembur
          </span>
          <p className="text-2xl font-bold text-amber-800 font-mono mt-1">{totalOvertimeHours} Jam</p>
          <span className="text-[11px] text-amber-600">Akumulasi overtime</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between print:hidden">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Departemen Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">Semua Departemen</option>
              {departments.filter(d => d !== 'all').map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">Semua Status Masuk</option>
            <option value="ontime">Hanya Tepat Waktu</option>
            <option value="late">Hanya Terlambat</option>
            <option value="outside">Di Luar Radius Kantor</option>
          </select>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama karyawan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Detailed Attendance Records Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Printable Letterhead Header */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
          <div className="text-center">
            <h2 className="text-lg font-bold uppercase">{office.name}</h2>
            <p className="text-xs text-slate-600">{office.address}</p>
            <p className="text-sm font-bold mt-2">REKAPITULASI LAPORAN KEHADIRAN KARYAWAN</p>
            <p className="text-xs text-slate-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div>
            <h2 className="text-base font-bold text-slate-800">Detail Log Kehadiran Pegawai</h2>
            <p className="text-xs text-slate-500">Lengkap dengan bukti selfie & koordinat GPS</p>
          </div>
          <span className="text-xs text-slate-400">Menampilkan: {filteredRecords.length} data</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada data kehadiran yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Karyawan</th>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Jam Masuk</th>
                  <th className="py-3 px-3">Status Masuk</th>
                  <th className="py-3 px-3">Jam Pulang</th>
                  <th className="py-3 px-3">Lembur</th>
                  <th className="py-3 px-3">Validasi Lokasi</th>
                  <th className="py-3 px-3 rounded-r-xl print:hidden">Foto Selfie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((item) => {
                  const emp = employees.find((e) => e.id === item.employeeId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{item.employeeName}</p>
                        <p className="text-[11px] text-slate-400">{emp?.nik} • {item.department}</p>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono font-semibold text-slate-800">
                        {item.clockInTime}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {item.clockInStatus === 'late' ? (
                          <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            Terlambat ({item.lateMinutes}m)
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Tepat Waktu
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono">
                        {item.clockOutTime || <span className="text-slate-400 italic">Belum Pulang</span>}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono">
                        {item.overtimeHours && item.overtimeHours > 0 ? (
                          <span className="text-amber-700 font-semibold">{item.overtimeHours} Jam</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          item.isClockInWithinRadius
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}>
                          {item.isClockInWithinRadius ? '✓ Radius Sesuai' : '⚠ Luar Radius'} ({item.clockInDistanceMeters}m)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap print:hidden">
                        <button
                          onClick={() => setSelectedPhoto(item.clockInPhoto)}
                          className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"
                        >
                          <img
                            src={item.clockInPhoto}
                            alt="Selfie"
                            className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                          />
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
              Bukti verifikasi foto selfie real-time pegawai
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
