'use client';

import React, { useState } from 'react';
import { Employee, LeaveRequest, LeaveType, LeaveStatus } from '@/lib/types';
import { formatIndonesianDate } from '@/lib/utils';
import { 
  CalendarDays, 
  PlusCircle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  AlertCircle,
  Eye,
  Check,
  X
} from 'lucide-react';

interface LeaveManagementProps {
  currentUser: Employee;
  employees: Employee[];
  leaves: LeaveRequest[];
  onAddLeave: (leave: LeaveRequest) => void;
  onReviewLeave: (leaveId: string, status: LeaveStatus, note: string) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  currentUser,
  employees,
  leaves,
  onAddLeave,
  onReviewLeave,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'my' | 'approvals'>('my');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('cuti_tahunan');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentData, setAttachmentData] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState('');

  // Review modal states
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);

  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';

  // Calculate day difference
  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const totalDays = calculateDays(startDate, endDate);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reason.trim()) {
      setErrorMsg('Alasan permohonan harus diisi.');
      return;
    }

    if (leaveType === 'cuti_tahunan' && totalDays > currentUser.leaveBalance) {
      setErrorMsg(`Sisa cuti tahunan Anda tidak mencukupi (${currentUser.leaveBalance} hari tersisa).`);
      return;
    }

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      type: leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      attachmentName: attachmentName || undefined,
      attachmentData: attachmentData || undefined,
      status: 'pending',
      createdAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID')}`,
    };

    onAddLeave(newLeave);
    setIsFormOpen(false);
    setReason('');
    setAttachmentName('');
    setAttachmentData(undefined);
  };

  const myLeaves = leaves.filter((l) => l.employeeId === currentUser.id);
  const pendingApprovals = leaves.filter((l) => l.status === 'pending');

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Disetujui
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Menunggu Persetujuan
          </span>
        );
    }
  };

  const getTypeLabel = (type: LeaveType) => {
    switch (type) {
      case 'cuti_tahunan':
        return { label: 'Cuti Tahunan', color: 'bg-blue-100 text-blue-800' };
      case 'sakit':
        return { label: 'Sakit', color: 'bg-rose-100 text-rose-800' };
      case 'izin':
        return { label: 'Izin Pribadi', color: 'bg-amber-100 text-amber-800' };
      case 'dinas_luar':
        return { label: 'Dinas Luar Kota', color: 'bg-purple-100 text-purple-800' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header and Toggle Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Manajemen Cuti & Izin Karyawan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pengajuan permohonan mandiri, lampiran surat keterangan, dan persetujuan atasan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrManager && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveSubTab('my')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeSubTab === 'my'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pengajuan Saya
              </button>
              <button
                onClick={() => setActiveSubTab('approvals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeSubTab === 'approvals'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Approval Atasan
                {pendingApprovals.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-sky-600/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Ajukan Cuti / Izin
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {activeSubTab === 'my' ? (
        // My Requests View
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Riwayat Pengajuan Saya</h2>
              <p className="text-xs text-slate-500">
                Sisa kuota Cuti Tahunan Anda: <strong className="text-sky-700">{currentUser.leaveBalance} Hari</strong>
              </p>
            </div>
            <span className="text-xs text-slate-400">Total: {myLeaves.length} data</span>
          </div>

          {myLeaves.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Anda belum pernah mengajukan cuti atau izin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Jenis</th>
                    <th className="py-3 px-3">Periode Tanggal</th>
                    <th className="py-3 px-3">Durasi</th>
                    <th className="py-3 px-3">Alasan</th>
                    <th className="py-3 px-3">Lampiran</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 rounded-r-xl">Catatan Atasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myLeaves.map((item) => {
                    const typeInfo = getTypeLabel(item.type);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-800">
                          {formatIndonesianDate(item.startDate)} {item.startDate !== item.endDate && `s/d ${formatIndonesianDate(item.endDate)}`}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-700">
                          {item.totalDays} Hari
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate" title={item.reason}>
                          {item.reason}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {item.attachmentName ? (
                            <button
                              onClick={() => {
                                if (item.attachmentData) {
                                  setPreviewAttachment(item.attachmentData);
                                } else {
                                  alert(`File lampiran: ${item.attachmentName}`);
                                }
                              }}
                              className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium underline"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {item.attachmentName.slice(0, 15)}...
                            </button>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {item.reviewNote ? (
                            <span className="text-xs text-slate-600 italic">"{item.reviewNote}"</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Approvals View (Admin / Manager)
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Daftar Persetujuan Cuti & Izin Pegawai</h2>
              <p className="text-xs text-slate-500">
                Persetujuan langsung oleh Atasan / HR Manager
              </p>
            </div>
            <span className="text-xs text-slate-400">Total: {leaves.length} pengajuan</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Karyawan</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Periode</th>
                  <th className="py-3 px-3">Durasi</th>
                  <th className="py-3 px-3">Alasan</th>
                  <th className="py-3 px-3">Lampiran</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 rounded-r-xl text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((item) => {
                  const typeInfo = getTypeLabel(item.type);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{item.employeeName}</p>
                        <p className="text-[11px] text-slate-400">{item.department}</p>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-800">
                        {item.startDate} {item.startDate !== item.endDate && `s/d ${item.endDate}`}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono">
                        {item.totalDays} Hari
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {item.attachmentName ? (
                          <button
                            onClick={() => {
                              if (item.attachmentData) {
                                setPreviewAttachment(item.attachmentData);
                              } else {
                                alert(`File: ${item.attachmentName}`);
                              }
                            }}
                            className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Lihat Dokumen
                          </button>
                        ) : (
                          <span className="text-slate-400">Tidak ada</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setReviewModalLeave(item);
                                setReviewNote('Disetujui.');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                            >
                              <Check className="w-3 h-3" /> Setujui
                            </button>
                            <button
                              onClick={() => {
                                setReviewModalLeave(item);
                                setReviewNote('Mohon maaf, permohonan belum dapat disetujui.');
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                            >
                              <X className="w-3 h-3" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Selesai di-review</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal: Ajukan Cuti/Izin */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base">
                Formulir Pengajuan Cuti / Izin
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Tipe Cuti */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Permohonan
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="cuti_tahunan">Cuti Tahunan (Sisa: {currentUser.leaveBalance} hari)</option>
                  <option value="sakit">Sakit (Dengan/Tanpa Surat Dokter)</option>
                  <option value="izin">Izin Kepentingan Pribadi / Keperluan Mendesak</option>
                  <option value="dinas_luar">Tugas / Perjalanan Dinas Luar Kantor</option>
                </select>
              </div>

              {/* Tanggal Mulai & Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex justify-between">
                <span>Total Pengambilan:</span>
                <span className="font-bold text-slate-800">{totalDays} Hari Kerja</span>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan alasan permohonan secara jelas..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required
                />
              </div>

              {/* Upload Lampiran Dokumen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lampiran Dokumen (Opsional / Surat Dokter / Tugas)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-medium">
                      {attachmentName ? attachmentName : 'Pilih file dari komputer / HP'}
                    </span>
                    <span className="text-[10px] text-slate-400">PDF, JPG, PNG (Maks 5MB)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/25"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal for Manager */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-base">
              Verifikasi Pengajuan: {reviewModalLeave.employeeName}
            </h3>
            
            <div className="text-xs space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700">
              <p><strong>Jenis:</strong> {reviewModalLeave.type.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Periode:</strong> {reviewModalLeave.startDate} s/d {reviewModalLeave.endDate} ({reviewModalLeave.totalDays} hari)</p>
              <p><strong>Alasan:</strong> {reviewModalLeave.reason}</p>
              {reviewModalLeave.attachmentName && (
                <p><strong>Lampiran:</strong> {reviewModalLeave.attachmentName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Persetujuan / Alasan Penolakan:
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalLeave(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onReviewLeave(reviewModalLeave.id, 'rejected', reviewNote || 'Ditolak.');
                  setReviewModalLeave(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Tolak
              </button>
              <button
                type="button"
                onClick={() => {
                  onReviewLeave(reviewModalLeave.id, 'approved', reviewNote || 'Disetujui.');
                  setReviewModalLeave(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4">
            <button
              onClick={() => setPreviewAttachment(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90"
            >
              ✕
            </button>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center">
              <img
                src={previewAttachment}
                alt="Lampiran Cuti/Surat Dokter"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-2 text-center text-xs text-slate-300">
              Lampiran Dokumen Pengajuan
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
