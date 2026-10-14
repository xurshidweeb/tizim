'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Coins, Lock, User, AlertCircle, ArrowRight, Shield, Building2, UserCheck, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kirishda xatolik yuz berdi');
      }

      router.push(data.redirectUrl || '/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoLogin: string) => {
    setLogin(demoLogin);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Ambient iOS Liquid Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-[24px] bg-gradient-to-tr from-emerald-400 to-teal-500 p-0.5 shadow-2xl shadow-emerald-500/30">
            <div className="h-full w-full bg-slate-950/90 rounded-[22px] flex items-center justify-center">
              <span className="text-2xl font-black text-white tracking-tight">IT</span>
            </div>
          </div>
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-black text-white tracking-tight">
          IT TIME ACADEMY
        </h1>
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-center text-xs sm:text-sm font-semibold text-emerald-400">
          <Coins size={16} className="text-amber-400 animate-pulse" />
          <span>Apple Liquid Glass CRM & Coin Market</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="liquid-glass-dark p-6 sm:p-8 rounded-[36px] shadow-2xl border border-white/15 backdrop-blur-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-300 text-xs font-semibold">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Foydalanuvchi Logini
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Masalan: URG-0001 yoki admin"
                  className="block w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Parol
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ios-press w-full min-h-[46px] flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl shadow-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Kirilmoqda...</span>
              ) : (
                <>
                  <span>Tizimga kirish</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins switcher */}
          <div className="mt-7 pt-5 border-t border-white/10">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Tezkor test akkauntlari:</span>
              <span className="text-[10px] text-emerald-400 font-mono">parol: password123</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('admin')}
                className="ios-press p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <Shield size={12} className="text-emerald-400" /> Super Admin
                </div>
                <div className="text-slate-400 text-[10px] font-mono mt-0.5">login: admin</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('URG-HEAD')}
                className="ios-press p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <Building2 size={12} className="text-blue-400" /> Filial Rahbari
                </div>
                <div className="text-slate-400 text-[10px] font-mono mt-0.5">URG-HEAD</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('URG-ADMIN')}
                className="ios-press p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <UserCheck size={12} className="text-teal-400" /> Admin
                </div>
                <div className="text-slate-400 text-[10px] font-mono mt-0.5">URG-ADMIN</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('URG-T01')}
                className="ios-press p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all"
              >
                <div className="font-bold text-white flex items-center gap-1">
                  <User size={12} className="text-purple-400" /> O'qituvchi
                </div>
                <div className="text-slate-400 text-[10px] font-mono mt-0.5">URG-T01</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('URG-0001')}
                className="ios-press col-span-2 p-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-2xl text-left transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <GraduationCap size={14} /> O'quvchi (Dilshod Karimov)
                  </div>
                  <div className="text-slate-400 text-[10px] font-mono mt-0.5">login: URG-0001 • Balans: 260 coin</div>
                </div>
                <Coins size={18} className="text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
