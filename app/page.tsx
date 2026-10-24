'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { LoginPage } from '@/components/LoginPage';
import { EmployeeDashboard } from '@/components/EmployeeDashboard';
import { LeaveManagement } from '@/components/LeaveManagement';
import { EmployeeManagement } from '@/components/EmployeeManagement';
import { ShiftManagement } from '@/components/ShiftManagement';
import { OfficeSettings } from '@/components/OfficeSettings';
import { ReportsDashboard } from '@/components/ReportsDashboard';
import { AttendanceModal } from '@/components/AttendanceModal';
import { 
  storage, 
  DEFAULT_EMPLOYEES, 
  DEFAULT_OFFICE, 
  DEFAULT_SHIFTS, 
  DEFAULT_ATTENDANCES, 
  DEFAULT_LEAVES,
  getTodayDateString
} from '@/lib/storage';
import { Employee, Shift, OfficeLocation, AttendanceRecord, LeaveRequest, LeaveStatus } from '@/lib/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('attendance');

  // Auth state
  const [authUser, setAuthUser] = useState<Employee | null>(null);

  // App data states
  const [office, setOffice] = useState<OfficeLocation>(DEFAULT_OFFICE);
  const [shifts, setShifts] = useState<Shift[]>(DEFAULT_SHIFTS);
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(DEFAULT_ATTENDANCES);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(DEFAULT_LEAVES);
  const [currentUser, setCurrentUser] = useState<Employee>(DEFAULT_EMPLOYEES[0]);

  // Modal states
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'clockIn' | 'clockOut'>('clockIn');

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Hydration & initial load
  useEffect(() => {
    setMounted(true);
    const loadedOffice = storage.getOffice();
    const loadedShifts = storage.getShifts();
    const loadedEmployees = storage.getEmployees();
    const loadedAttendances = storage.getAttendances();
    const loadedLeaves = storage.getLeaves();
    const savedAuth = storage.getAuthUser();

    setOffice(loadedOffice);
    setShifts(loadedShifts);
    setEmployees(loadedEmployees);
    setAttendances(loadedAttendances);
    setLeaves(loadedLeaves);

    if (savedAuth) {
      // Find latest updated version from employees list
      const freshUser = loadedEmployees.find((e) => e.id === savedAuth.id) || savedAuth;
      setAuthUser(freshUser);
      setCurrentUser(freshUser);
    }
  }, []);

  // Today's attendance record for current user
  const todayStr = getTodayDateString();
  const todayRecord = attendances.find(
    (a) => a.employeeId === currentUser?.id && a.date === todayStr
  );

  // Today's shift for current user
  const currentShift = shifts.find((s) => s.id === currentUser?.shiftId) || shifts[0];

  // Auth Handlers
  const handleLoginSuccess = (user: Employee) => {
    setAuthUser(user);
    setCurrentUser(user);
    storage.setAuthUser(user);
    setActiveTab('attendance');
    showToast(`Selamat datang, ${user.name}! Anda masuk sebagai ${user.role === 'admin' ? 'HR Admin' : 'Karyawan'}.`);
  };

  const handleLogout = () => {
    setAuthUser(null);
    storage.setAuthUser(null);
    showToast('Anda telah berhasil keluar dari akun.');
  };

  // User switcher
  const handleUserChange = (newUser: Employee) => {
    setCurrentUser(newUser);
    setAuthUser(newUser);
    storage.setAuthUser(newUser);
    showToast(`Beralih akun ke: ${newUser.name} (${newUser.role.toUpperCase()})`);
  };

  // Reset demo data
  const handleResetData = () => {
    storage.resetToDefault();
    setOffice(DEFAULT_OFFICE);
    setShifts(DEFAULT_SHIFTS);
    setEmployees(DEFAULT_EMPLOYEES);
    setAttendances(DEFAULT_ATTENDANCES);
    setLeaves(DEFAULT_LEAVES);
    setCurrentUser(DEFAULT_EMPLOYEES[0]);
    setAuthUser(DEFAULT_EMPLOYEES[0]);
    setActiveTab('attendance');
    showToast('Data demo berhasil di-reset ke kondisi awal!');
  };

  // Open attendance modal
  const handleOpenAttendanceModal = (type: 'clockIn' | 'clockOut') => {
    setAttendanceType(type);
    setIsAttendanceModalOpen(true);
  };

  // Submit attendance from modal
  const handleSubmitAttendance = (attendanceData: Partial<AttendanceRecord>) => {
    if (attendanceType === 'clockIn') {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        department: currentUser.department,
        date: todayStr,
        clockInTime: attendanceData.clockInTime || '08:00:00',
        clockInPhoto: attendanceData.clockInPhoto || '',
        clockInLat: attendanceData.clockInLat || office.latitude,
        clockInLng: attendanceData.clockInLng || office.longitude,
        clockInDistanceMeters: attendanceData.clockInDistanceMeters || 0,
        isClockInWithinRadius: attendanceData.isClockInWithinRadius ?? true,
        clockInStatus: attendanceData.clockInStatus || 'ontime',
        lateMinutes: attendanceData.lateMinutes || 0,
        clockInAddress: attendanceData.clockInAddress,
      };

      const updated = [newRecord, ...attendances.filter((a) => a.id !== newRecord.id)];
      setAttendances(updated);
      storage.saveAttendances(updated);

      if (newRecord.clockInStatus === 'late') {
        showToast(`Absen Masuk Berhasil! Anda tercatat terlambat ${newRecord.lateMinutes} menit.`, 'error');
      } else {
        showToast('Absen Masuk Berhasil! Status: Tepat Waktu.');
      }
    } else {
      // Clock Out
      const updated = attendances.map((rec) => {
        if (rec.employeeId === currentUser.id && rec.date === todayStr) {
          return {
            ...rec,
            clockOutTime: attendanceData.clockOutTime,
            clockOutPhoto: attendanceData.clockOutPhoto,
            clockOutLat: attendanceData.clockOutLat,
            clockOutLng: attendanceData.clockOutLng,
            clockOutDistanceMeters: attendanceData.clockOutDistanceMeters,
            isClockOutWithinRadius: attendanceData.isClockOutWithinRadius,
            clockOutStatus: attendanceData.clockOutStatus,
            overtimeHours: attendanceData.overtimeHours,
            clockOutAddress: attendanceData.clockOutAddress,
          };
        }
        return rec;
      });

      setAttendances(updated);
      storage.saveAttendances(updated);
      showToast('Absen Pulang Berhasil! Sampai jumpa besok.');
    }
  };

  // Update office coordinates quickly to user's location
  const handleUpdateOfficeToCurrentLocation = (lat: number, lng: number) => {
    const updated = {
      ...office,
      latitude: lat,
      longitude: lng,
    };
    setOffice(updated);
    storage.saveOffice(updated);
    showToast('Lokasi kantor demo telah disesuaikan ke posisi GPS Anda saat ini!');
  };

  // Leave Handlers
  const handleAddLeave = (newLeave: LeaveRequest) => {
    const updated = [newLeave, ...leaves];
    setLeaves(updated);
    storage.saveLeaves(updated);
    showToast('Permohonan cuti/izin berhasil diajukan dan menunggu persetujuan.');
  };

  const handleReviewLeave = (leaveId: string, status: LeaveStatus, note: string) => {
    let leaveItem = leaves.find((l) => l.id === leaveId);
    if (!leaveItem) return;

    const updated = leaves.map((l) =>
      l.id === leaveId
        ? {
            ...l,
            status,
            reviewNote: note,
            reviewedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
            reviewedAt: `${todayStr} ${new Date().toLocaleTimeString('id-ID')}`,
          }
        : l
    );

    // If approved and cuti_tahunan, deduct leaveBalance
    if (status === 'approved' && leaveItem.type === 'cuti_tahunan') {
      const updatedEmployees = employees.map((emp) => {
        if (emp.id === leaveItem.employeeId) {
          return {
            ...emp,
            leaveBalance: Math.max(0, emp.leaveBalance - leaveItem.totalDays),
          };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
      storage.saveEmployees(updatedEmployees);
    }

    setLeaves(updated);
    storage.saveLeaves(updated);
    showToast(`Pengajuan berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}.`);
  };

  // Employee Management handler
  const handleSaveEmployees = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    storage.saveEmployees(updatedEmployees);

    // Sync active user if updated
    const freshCurrentUser = updatedEmployees.find((e) => e.id === currentUser.id);
    if (freshCurrentUser) {
      setCurrentUser(freshCurrentUser);
      setAuthUser(freshCurrentUser);
      storage.setAuthUser(freshCurrentUser);
    }
    showToast('Data master karyawan berhasil diperbarui.');
  };

  // Shift & Office Save handlers
  const handleSaveShifts = (updatedShifts: Shift[]) => {
    setShifts(updatedShifts);
    storage.saveShifts(updatedShifts);
    showToast('Daftar shift berhasil disimpan.');
  };

  const handleUpdateEmployeeShift = (employeeId: string, shiftId: string) => {
    const updated = employees.map((emp) =>
      emp.id === employeeId ? { ...emp, shiftId } : emp
    );
    setEmployees(updated);
    storage.saveEmployees(updated);
    showToast('Penugasan shift karyawan berhasil diperbarui.');
  };

  const handleSaveOffice = (updatedOffice: OfficeLocation) => {
    setOffice(updatedOffice);
    storage.saveOffice(updatedOffice);
    showToast('Pengaturan lokasi & geofence kantor berhasil disimpan.');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-300 font-medium">Memuat PresensiKu...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the Login Page
  if (!authUser) {
    return (
      <>
        {toast && (
          <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
            <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
        <LoginPage
          employees={employees}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        employees={employees}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUserChange={handleUserChange}
        onResetData={handleResetData}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'attendance' && (
          <EmployeeDashboard
            currentUser={currentUser}
            todayShift={currentShift}
            office={office}
            todayRecord={todayRecord}
            attendanceHistory={attendances}
            onOpenAttendanceModal={handleOpenAttendanceModal}
          />
        )}

        {activeTab === 'leave' && (
          <LeaveManagement
            currentUser={currentUser}
            employees={employees}
            leaves={leaves}
            onAddLeave={handleAddLeave}
            onReviewLeave={handleReviewLeave}
          />
        )}

        {activeTab === 'employees' && currentUser.role === 'admin' && (
          <EmployeeManagement
            employees={employees}
            shifts={shifts}
            currentUserId={currentUser.id}
            onSaveEmployees={handleSaveEmployees}
          />
        )}

        {activeTab === 'shifts' && currentUser.role === 'admin' && (
          <ShiftManagement
            shifts={shifts}
            employees={employees}
            onSaveShifts={handleSaveShifts}
            onUpdateEmployeeShift={handleUpdateEmployeeShift}
          />
        )}

        {activeTab === 'office' && currentUser.role === 'admin' && (
          <OfficeSettings
            office={office}
            onSaveOffice={handleSaveOffice}
          />
        )}

        {activeTab === 'reports' && currentUser.role === 'admin' && (
          <ReportsDashboard
            attendances={attendances}
            employees={employees}
            office={office}
          />
        )}
      </main>

      {/* Attendance Modal (Camera & GPS) */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        type={attendanceType}
        employee={currentUser}
        shift={currentShift}
        office={office}
        existingRecord={todayRecord}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSubmit={handleSubmitAttendance}
        onUpdateOfficeToCurrentLocation={handleUpdateOfficeToCurrentLocation}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-400 print:hidden">
        PresensiKu &copy; 2026 • Sistem Absensi Karyawan Webbase (GPS Geofencing, Live Selfie, Shift & Cuti)
      </footer>

    </div>
  );
}
