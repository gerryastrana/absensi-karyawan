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
  AlertCircle,
  HelpCircle
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
        setErrorMsg('Email atau NIK tidak terdaftar. Pastikan identitas yang Anda masukkan benar.');
        setIsLoading(false);
        return;
      }

      // Check password
      const validPassword = user.password || (user.role === 'admin' ? 'admin123' : 'karyawan123');
      if (password !== validPassword) {
        setErrorMsg('Password yang Anda masukkan salah. Silakan periksa kembali.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand & Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/30 mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PresensiKu
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Sistem Absensi Karyawan Berbasis Web & Geolocation
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masukkan Email atau NIK beserta password terdaftar.
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
                  placeholder="Masukkan email atau NIK..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
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
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
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
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>

          {/* Help Info Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2.5 text-slate-500 text-[11px] leading-relaxed">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Lupa password atau akun belum terdaftar? Silakan hubungi bagian <strong>HRD / Administrator</strong> untuk reset kata sandi atau pendaftaran pegawai.
            </span>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          PresensiKu &copy; 2026 • Sistem Absensi Karyawan Berbasis Web
        </p>

      </div>
    </div>
  );
};
