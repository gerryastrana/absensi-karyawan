'use client';

import React, { useState } from 'react';
import { Shift, Employee } from '@/lib/types';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Users, 
  CalendarCheck, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface ShiftManagementProps {
  shifts: Shift[];
  employees: Employee[];
  onSaveShifts: (shifts: Shift[]) => void;
  onUpdateEmployeeShift: (employeeId: string, shiftId: string) => void;
}

export const ShiftManagement: React.FC<ShiftManagementProps> = ({
  shifts,
  employees,
  onSaveShifts,
  onUpdateEmployeeShift,
}) => {
  const [activeTab, setActiveTab] = useState<'shifts' | 'roster'>('shifts');
  const [editingShift, setEditingShift] = useState<Partial<Shift> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for adding/editing shift
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [gracePeriod, setGracePeriod] = useState(15);
  const [color, setColor] = useState('#0284c7');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingShift(null);
    setName('');
    setStartTime('08:00');
    setEndTime('17:00');
    setGracePeriod(15);
    setColor('#0284c7');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Shift) => {
    setEditingShift(s);
    setName(s.name);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setGracePeriod(s.gracePeriodMinutes);
    setColor(s.color);
    setDescription(s.description || '');
    setIsModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift && editingShift.id) {
      // Update
      const updated = shifts.map((s) =>
        s.id === editingShift.id
          ? {
              ...s,
              name,
              startTime,
              endTime,
              gracePeriodMinutes: Number(gracePeriod),
              color,
              description,
            }
          : s
      );
      onSaveShifts(updated);
    } else {
      // Create new
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        name,
        startTime,
        endTime,
        gracePeriodMinutes: Number(gracePeriod),
        color,
        description,
      };
      onSaveShifts([...shifts, newShift]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteShift = (id: string) => {
    if (shifts.length <= 1) {
      alert('Minimal harus ada 1 shift dalam sistem.');
      return;
    }
    if (confirm('Yakin ingin menghapus shift ini? Karyawan dengan shift ini akan dialihkan ke shift standar.')) {
      const remaining = shifts.filter((s) => s.id !== id);
      onSaveShifts(remaining);
      // Reassign affected employees to the first available shift
      employees.forEach((emp) => {
        if (emp.shiftId === id) {
          onUpdateEmployeeShift(emp.id, remaining[0].id);
        }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Pengaturan Jadwal Kerja & Shift Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola master shift, jam masuk, jam pulang, toleransi telat, dan distribusikan ke karyawan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('shifts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'shifts'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Master Shift ({shifts.length})
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'roster'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Penugasan Karyawan ({employees.length})
            </button>
          </div>

          {activeTab === 'shifts' && (
            <button
              onClick={openCreateModal}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tambah Shift
            </button>
          )}
        </div>
      </div>

      {activeTab === 'shifts' ? (
        // Master Shift Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shifts.map((shift) => {
            const assignedCount = employees.filter((e) => e.shiftId === shift.id).length;
            return (
              <div
                key={shift.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: shift.color || '#0284c7' }}
                      />
                      <h3 className="font-bold text-slate-800 text-sm">{shift.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(shift)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition"
                        title="Edit Shift"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                        title="Hapus Shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Jam Operasional:</span>
                      <span className="font-bold font-mono text-slate-800 text-sm">
                        {shift.startTime} - {shift.endTime} WIB
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200/60">
                      <span>Batas Toleransi Telat:</span>
                      <span className="font-semibold text-slate-700">
                        {shift.gracePeriodMinutes} Menit
                      </span>
                    </div>
                  </div>

                  {shift.description && (
                    <p className="text-xs text-slate-500 mt-3">{shift.description}</p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {assignedCount} Karyawan Ditugaskan
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {shift.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Roster / Employee Assignment Table
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Distribusi Jadwal Shift Karyawan</h2>
              <p className="text-xs text-slate-500">
                Pilih dan ubah shift kerja masing-masing karyawan secara langsung
              </p>
            </div>
            <span className="text-xs text-slate-400">Total: {employees.length} Karyawan</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Karyawan</th>
                  <th className="py-3 px-3">Departemen & Jabatan</th>
                  <th className="py-3 px-3">Role Sistem</th>
                  <th className="py-3 px-3 rounded-r-xl">Shift yang Ditugaskan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const currentShift = shifts.find((s) => s.id === emp.shiftId) || shifts[0];
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{emp.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{emp.nik}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="text-slate-800 font-medium">{emp.department}</p>
                        <p className="text-[11px] text-slate-400">{emp.position}</p>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          emp.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: currentShift?.color || '#0284c7' }}
                          />
                          <select
                            value={emp.shiftId}
                            onChange={(e) => onUpdateEmployeeShift(emp.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                          >
                            {shifts.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.startTime} - {s.endTime})
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingShift ? 'Edit Jadwal Shift' : 'Tambah Shift Kerja Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Shift
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Shift Pagi Operasional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pulang
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Toleransi Telat (Menit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warna Indikator
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Catatan Operasional
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan singkat aturan shift..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/25"
                >
                  {editingShift ? 'Simpan Perubahan' : 'Buat Shift Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
