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
  X,
  Award,
  Building2,
  Mail,
  Cloud,
  Database
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface NavbarProps {
  currentUser: Employee;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
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
                {isSupabaseConfigured ? (
                  <span 
                    title="Terhubung ke Supabase Cloud PostgreSQL" 
                    className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 border border-emerald-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Cloud className="w-3 h-3" /> Supabase
                  </span>
                ) : (
                  <span 
                    title="Supabase belum aktif di .env.local. Data disimpan di penyimpanan browser lokal." 
                    className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200"
                  >
                    <Database className="w-3 h-3" /> Mode Lokal
                  </span>
                )}
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
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

          {/* Right Action: Digital Clock & User Profile */}
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

            {/* User Profile Popover */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                title="Profil Pengguna"
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
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* User Profile Card */}
                  <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{currentUser.nik}</p>
                      <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {currentUser.role === 'admin' ? 'HR ADMINISTRATOR' : 'KARYAWAN'}
                      </span>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="px-4 py-2.5 space-y-1.5 text-xs text-slate-600 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{currentUser.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Sisa Cuti:
                      </span>
                      <strong className="text-sky-700 font-mono">{currentUser.leaveBalance} Hari</strong>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="pt-2 px-3">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar / Logout Akun
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
              Keluar / Logout Akun
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
