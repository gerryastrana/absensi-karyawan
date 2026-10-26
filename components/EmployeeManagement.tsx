'use client';

import React, { useState } from 'react';
import { Employee, Shift } from '@/lib/types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  Phone, 
  Award, 
  Clock, 
  Check, 
  X, 
  AlertCircle,
  Building2,
  Lock
} from 'lucide-react';

interface EmployeeManagementProps {
  employees: Employee[];
  shifts: Shift[];
  currentUserId: string;
  onSaveEmployees: (employees: Employee[], deletedEmployeeId?: string) => void | Promise<void>;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  shifts,
  currentUserId,
  onSaveEmployees,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Reset password modal state
  const [resetPasswordEmp, setResetPasswordEmp] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form states for Add / Edit
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Teknologi Informasi');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [shiftId, setShiftId] = useState(shifts[0]?.id || 'shift-1');
  const [leaveBalance, setLeaveBalance] = useState(12);
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [formError, setFormError] = useState('');

  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))];

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    if (selectedDept !== 'all' && emp.department !== selectedDept) return false;
    if (selectedRole !== 'all' && emp.role !== selectedRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchNik = emp.nik.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchPos = emp.position.toLowerCase().includes(q);
      if (!matchName && !matchNik && !matchEmail && !matchPos) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingEmployee(null);
    setNik(`KRY-${new Date().getFullYear()}-${String(employees.length + 1).padStart(3, '0')}`);
    setName('');
    setEmail('');
    setPassword('karyawan123');
    setDepartment('Teknologi Informasi');
    setPosition('');
    setRole('employee');
    setShiftId(shifts[0]?.id || 'shift-1');
    setLeaveBalance(12);
    setPhone('');
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setNik(emp.nik);
    setName(emp.name);
    setEmail(emp.email);
    setPassword(emp.password || '');
    setDepartment(emp.department);
    setPosition(emp.position);
    setRole(emp.role === 'admin' ? 'admin' : 'employee');
    setShiftId(emp.shiftId || shifts[0]?.id || 'shift-1');
    setLeaveBalance(emp.leaveBalance);
    setPhone(emp.phone || '');
    setAvatar(emp.avatar);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    const cleanEmail = email.trim().toLowerCase();
    const cleanNik = nik.trim();

    // Check duplicate email or NIK
    const isDupEmail = employees.some(
      (e) => e.email.toLowerCase() === cleanEmail && (!editingEmployee || e.id !== editingEmployee.id)
    );
    if (isDupEmail) {
      setFormError('Alamat email sudah terdaftar untuk karyawan lain.');
      return;
    }

    const isDupNik = employees.some(
      (e) => e.nik.toLowerCase() === cleanNik.toLowerCase() && (!editingEmployee || e.id !== editingEmployee.id)
    );
    if (isDupNik) {
      setFormError('Nomor Induk Karyawan (NIK) sudah digunakan.');
      return;
    }

    if (editingEmployee) {
      // Update
      const updated = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              nik: cleanNik,
              name: name.trim(),
              email: cleanEmail,
              password: password.trim() || emp.password || 'karyawan123',
              department,
              position: position.trim(),
              role,
              shiftId,
              leaveBalance: Number(leaveBalance),
              phone: phone.trim(),
              avatar: avatar.trim() || emp.avatar,
            }
          : emp
      );
      onSaveEmployees(updated);
    } else {
      // Create new
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        nik: cleanNik,
        name: name.trim(),
        email: cleanEmail,
        password: password.trim() || 'karyawan123',
        department,
        position: position.trim(),
        role,
        shiftId,
        leaveBalance: Number(leaveBalance),
        phone: phone.trim(),
        avatar: avatar.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanNik}`,
      };
      onSaveEmployees([...employees, newEmp]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteEmployee = (id: string) => {
    if (id === currentUserId) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      return;
    }
    if (confirm('Yakin ingin menghapus data karyawan ini dari sistem?')) {
      const updated = employees.filter((e) => e.id !== id);
      onSaveEmployees(updated, id);
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordEmp || !newPassword.trim()) return;

    const updated = employees.map((emp) =>
      emp.id === resetPasswordEmp.id
        ? { ...emp, password: newPassword.trim() }
        : emp
    );
    onSaveEmployees(updated);
    setResetPasswordEmp(null);
    setNewPassword('');
    alert('Password karyawan berhasil diperbarui!');
  };

  // Metrics
  const totalCount = employees.length;
  const adminCount = employees.filter((e) => e.role === 'admin').length;
  const employeeCount = employees.filter((e) => e.role === 'employee').length;
  const deptCount = Array.from(new Set(employees.map((e) => e.department))).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Manajemen Akun & Data Karyawan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola identitas, akses akun login, departemen, role sistem, dan jatah cuti karyawan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md shadow-sky-600/25 transition active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Karyawan Baru
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-600" /> Total Karyawan
          </span>
          <p className="text-2xl font-bold text-slate-800 font-mono mt-1">{totalCount}</p>
          <span className="text-[11px] text-slate-400">Pegawai terdaftar</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> HR Admin
          </span>
          <p className="text-2xl font-bold text-amber-800 font-mono mt-1">{adminCount}</p>
          <span className="text-[11px] text-amber-600">Akses administrator</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" /> Karyawan Aktif
          </span>
          <p className="text-2xl font-bold text-emerald-800 font-mono mt-1">{employeeCount}</p>
          <span className="text-[11px] text-emerald-600">Staff operasional</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" /> Departemen
          </span>
          <p className="text-2xl font-bold text-indigo-800 font-mono mt-1">{deptCount}</p>
          <span className="text-[11px] text-indigo-600">Divisi operasional</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
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

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">Semua Role</option>
            <option value="admin">HR Admin Saja</option>
            <option value="employee">Karyawan Saja</option>
          </select>
        </div>

        {/* Search Query */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIK, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Daftar Karyawan</h2>
            <p className="text-xs text-slate-500">Total {filteredEmployees.length} karyawan ditemukan</p>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada data karyawan yang sesuai dengan pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Karyawan</th>
                  <th className="py-3 px-3">Kontak & Akun</th>
                  <th className="py-3 px-3">Departemen & Jabatan</th>
                  <th className="py-3 px-3">Shift Kerja</th>
                  <th className="py-3 px-3">Sisa Cuti</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 rounded-r-xl text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const currentShift = shifts.find((s) => s.id === emp.shiftId) || shifts[0];
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Name & NIK */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{emp.name}</p>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {emp.nik}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="text-slate-700 flex items-center gap-1.5 font-medium">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {emp.email}
                        </p>
                        {emp.phone && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {emp.phone}
                          </p>
                        )}
                      </td>

                      {/* Department & Position */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{emp.department}</p>
                        <p className="text-[11px] text-slate-400">{emp.position}</p>
                      </td>

                      {/* Shift */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentShift?.color || '#0284c7' }}
                          />
                          {currentShift?.name}
                        </span>
                      </td>

                      {/* Leave Balance */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono">
                        <span className="font-bold text-sky-700">{emp.leaveBalance}</span>
                        <span className="text-slate-400 text-[11px]"> Hari</span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {emp.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> HR Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            <UserCheck className="w-3 h-3" /> Karyawan
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setResetPasswordEmp(emp);
                              setNewPassword('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Reset Password Akun"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            title="Edit Data Karyawan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            disabled={emp.id === currentUserId}
                            className={`p-1.5 rounded-lg transition ${
                              emp.id === currentUserId
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={emp.id === currentUserId ? 'Akun aktif Anda' : 'Hapus Karyawan'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Avatar Preview */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'user'}`}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Foto Profil / Avatar
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {/* NIK & Nama Lengkap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Induk Karyawan (NIK)
                  </label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="KRY-2024-001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Pegawai..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Perusahaan (Login)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Akun
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              </div>

              {/* Departemen & Jabatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departemen / Divisi
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Teknologi Informasi, HR, Finance..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Staff, Supervisor, Manager..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              </div>

              {/* Role & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hak Akses (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'employee' | 'admin')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="employee">Karyawan (Absensi & Cuti)</option>
                    <option value="admin">HR Admin (Akses Penuh Semua Menu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Kerja Default
                  </label>
                  <select
                    value={shiftId}
                    onChange={(e) => setShiftId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sisa Cuti & Nomor Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Saldo Cuti Tahunan (Hari)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={leaveBalance}
                    onChange={(e) => setLeaveBalance(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3">
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
                  {editingEmployee ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordEmp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Reset Password</h3>
                <p className="text-xs text-slate-500">{resetPasswordEmp.name}</p>
              </div>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordEmp(null)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
                >
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
