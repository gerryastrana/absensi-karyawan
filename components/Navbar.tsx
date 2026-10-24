'use client';

import React, { useState, useEffect } from 'react';
import { Employee } from '@/lib/types';
import { 
  Clock, 
  MapPin, 
  CalendarDays, 
  FileSpreadsheet, 
  Settings, 
  UserCheck, 
  ChevronDown, 
  ShieldCheck, 
  UserCircle2,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentUser: Employee;
  employees: Employee[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUserChange: (user: Employee) => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  employees,
  activeTab,
  onTabChange,
  onUserChange,
  onResetData,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = currentUser.role === 'admin';

  const navItems = [
    { id: 'attendance', label: 'Absensi Saya', icon: UserCheck, show: true },
    { id: 'leave', label: 'Cuti & Izin', icon: CalendarDays, show: true },
    { id: 'employees', label: 'Kelola Karyawan', icon: Users, show: isAdmin },
    { id: 'shifts', label: 'Jadwal & Shift', icon: Clock, show: isAdmin },
    { id: 'office', label: 'Lokasi & Geofence', icon: MapPin, show: isAdmin },
    { id: 'reports', label: 'Laporan & Rekap', icon: FileSpreadsheet, show: isAdmin },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-800 tracking-tight">PresensiKu</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  Cloud Live
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Sistem Absensi GPS & Kamera Wajah</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-xs border border-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Digital Clock & User Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Live Clock Badge */}
            <div className="hidden lg:flex flex-col text-right pr-2 border-r border-slate-200">
              <span className="text-xs font-semibold text-slate-700 tracking-wide font-mono">
                {currentTime || '00:00:00'} WIB
              </span>
              <span className="text-[11px] text-slate-400">
                {currentDate}
              </span>
            </div>

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                title="Profil & Ganti Pengguna"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-sky-500/20"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase mt-0.5">
                    {currentUser.role === 'admin' ? 'HR Admin' : 'Karyawan'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pilih Akun Demo</p>
                    <p className="text-xs text-slate-600 mt-0.5">Ganti role untuk mencoba fitur karyawan / HR:</p>
                  </div>
                  <div className="py-1 max-h-56 overflow-y-auto">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          onUserChange(emp);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                          emp.id === currentUser.id ? 'bg-sky-50/70 text-sky-700' : 'text-slate-700'
                        }`}
                      >
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{emp.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{emp.department} • {emp.role.toUpperCase()}</p>
                        </div>
                        {emp.role === 'admin' && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                            HR
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1.5 px-3 space-y-1">
                    <button
                      onClick={() => {
                        if (confirm('Kembalikan semua data ke pengaturan awal (default)?')) {
                          onResetData();
                          setUserDropdownOpen(false);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 rounded-lg transition"
                    >
                      Reset Data Demo
                    </button>
                    
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar / Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-5 h-5" />
              Keluar / Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
