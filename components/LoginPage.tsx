'use client';

import React, { useState } from 'react';
import { Employee } from '@/lib/types';
import { 
  Clock, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  User, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LoginPageProps {
  employees: Employee[];
  onLoginSuccess: (user: Employee) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  employees,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanId = identifier.trim().toLowerCase();
      const user = employees.find(
        (emp) =>
          emp.email.toLowerCase() === cleanId ||
          emp.nik.toLowerCase() === cleanId
      );

      if (!user) {
        setErrorMsg('Email atau NIK tidak ditemukan dalam sistem.');
        setIsLoading(false);
        return;
      }

      // Check password
      const validPassword = user.password || (user.role === 'admin' ? 'admin123' : 'karyawan123');
      if (password !== validPassword) {
        setErrorMsg('Password yang Anda masukkan salah. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  const handleQuickLogin = (role: 'admin' | 'employee') => {
    const target = employees.find((e) => e.role === role) || employees[0];
    onLoginSuccess(target);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand & Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/30 mb-4 animate-bounce duration-1000">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PresensiKu
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Portal Absensi Webbase, Geolocation & Verifikasi Wajah
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Selamat Datang!</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masuk dengan akun karyawan atau HR Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Identifier input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email atau NIK Pegawai
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="contoh: budi.santoso@perusahaan.com atau KRY-2024-001"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Default: <em>admin123 / karyawan123</em>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk ke Aplikasi
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Akses Cepat Pengujian (1-Click Demo)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-left transition flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-amber-900">HR Admin</p>
                  <p className="text-[10px] text-amber-700">Siti Rahmawati</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('employee')}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/80 text-left transition flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-sky-900">Karyawan</p>
                  <p className="text-[10px] text-sky-700">Budi Santoso</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-sky-600 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          PresensiKu &copy; 2026 • Sistem Absensi Online Modern & PWA Ready
        </p>

      </div>
    </div>
  );
};
