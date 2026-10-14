'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Layers, 
  ShoppingBag, 
  Award, 
  ShieldAlert, 
  FileSpreadsheet, 
  LogOut, 
  Coins, 
  CheckSquare, 
  History, 
  Menu, 
  X,
  Target,
  Sparkles,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  mobilePrimary?: boolean; // Pastki paneldagi asosiy 4 ta tugma uchun
}

interface DashboardLayoutProps {
  user: {
    fullName: string;
    login: string;
    role: string;
    branchName?: string;
    coinBalance?: number;
  };
  children: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Rolga qarab navigatsiya punktlari
  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Boshqaruv', href: '/super-admin', icon: Building2, mobilePrimary: true },
          { label: 'Filiallar', href: '/super-admin/branches', icon: Building2, mobilePrimary: true },
          { label: 'Xodimlar', href: '/super-admin/staff', icon: Users, mobilePrimary: true },
          { label: 'Guruhlar', href: '/admin/groups', icon: Layers },
          { label: 'O\'quvchilar', href: '/admin/students', icon: GraduationCap },
          { label: 'Market', href: '/admin/orders', icon: ShoppingBag, mobilePrimary: true },
          { label: 'Reytinglar', href: '/admin/ratings', icon: Award },
          { label: 'Jarima/Bonus', href: '/super-admin/penalties', icon: ShieldAlert },
          { label: 'Audit', href: '/super-admin/audit', icon: History },
        ];
      case 'BRANCH_HEAD':
        return [
          { label: 'Panel', href: '/branch-head', icon: Building2, mobilePrimary: true },
          { label: 'O\'qituvchilar', href: '/super-admin/staff', icon: Users, mobilePrimary: true },
          { label: 'Guruhlar', href: '/admin/groups', icon: Layers, mobilePrimary: true },
          { label: 'O\'quvchilar', href: '/admin/students', icon: GraduationCap, mobilePrimary: true },
          { label: 'Buyurtmalar', href: '/admin/orders', icon: ShoppingBag },
          { label: 'Reyting', href: '/admin/ratings', icon: Award },
          { label: 'Jarima/Bonus', href: '/super-admin/penalties', icon: ShieldAlert },
        ];
      case 'ADMIN':
        return [
          { label: 'Boshqaruv', href: '/admin', icon: Layers, mobilePrimary: true },
          { label: 'O\'quvchilar', href: '/admin/students', icon: GraduationCap, mobilePrimary: true },
          { label: 'Guruhlar', href: '/admin/groups', icon: Layers, mobilePrimary: true },
          { label: 'Buyurtmalar', href: '/admin/orders', icon: ShoppingBag, mobilePrimary: true },
          { label: 'To\'lovlar', href: '/admin/payments', icon: CheckSquare },
          { label: 'Login & Excel', href: '/admin/import-export', icon: FileSpreadsheet },
          { label: 'Reytinglar', href: '/admin/ratings', icon: Award },
        ];
      case 'TEACHER':
        return [
          { label: 'Guruhlarim', href: '/teacher', icon: Layers, mobilePrimary: true },
          { label: 'Davomat', href: '/teacher/attendance', icon: CheckSquare, mobilePrimary: true },
          { label: '110 Ball', href: '/teacher/monthly', icon: Target, mobilePrimary: true },
          { label: 'Reyting', href: '/teacher/ratings', icon: Award, mobilePrimary: true },
        ];
      case 'STUDENT':
        return [
          { label: 'Asosiy', href: '/student', icon: GraduationCap, mobilePrimary: true },
          { label: 'Market', href: '/student/market', icon: ShoppingBag, mobilePrimary: true },
          { label: 'Buyurtmalar', href: '/student/orders', icon: CheckSquare, mobilePrimary: true },
          { label: 'Reyting', href: '/student/ratings', icon: Award, mobilePrimary: true },
          { label: 'Tarix', href: '/student/history', icon: Coins },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const mobilePrimaryItems = navItems.filter((item) => item.mobilePrimary).slice(0, 4);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const roleNames: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    BRANCH_HEAD: 'Filial Rahbari',
    ADMIN: 'Admin',
    TEACHER: 'O\'qituvchi',
    STUDENT: 'O\'quvchi',
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 1. iOS Style Sticky Top Bar (Mobile) */}
      <header className="md:hidden sticky top-0 z-40 liquid-glass border-b border-white/50 px-4 py-2.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xs text-white">
              IT
            </div>
          </div>
          <div>
            <div className="font-extrabold text-xs tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>IT TIME</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                {roleNames[user.role] || user.role}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
              {user.fullName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'STUDENT' && (
            <Link
              href="/student/market"
              className="ios-press px-2.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 font-extrabold text-xs flex items-center gap-1 shadow-sm"
            >
              <Coins size={13} className="text-amber-500" />
              <span>{user.coinBalance ?? 0}</span>
            </Link>
          )}

          <button
            onClick={() => setSidebarOpen(true)}
            className="ios-press h-9 w-9 rounded-2xl liquid-glass-card flex items-center justify-center text-slate-700 hover:text-slate-900"
            aria-label="Menyu"
          >
            <Menu size={19} />
          </button>
        </div>
      </header>

      {/* 2. Desktop Floating Liquid Glass Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 p-4 m-3 liquid-glass-dark rounded-3xl text-white shadow-2xl z-30 shrink-0 sticky top-3 h-[calc(100vh-1.5rem)]">
        <div>
          {/* Brand header */}
          <div className="p-3 mb-2 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-base text-white shadow-lg shadow-emerald-950/40">
              IT
            </div>
            <div>
              <div className="font-black text-sm tracking-wide text-white">IT TIME ACADEMY</div>
              <div className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                <Sparkles size={10} /> Liquid CRM
              </div>
            </div>
          </div>

          {/* User profile card */}
          <div className="p-3.5 mx-1 mb-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {roleNames[user.role] || user.role}
              </span>
              {user.branchName && (
                <span className="text-[10px] text-slate-300 font-medium px-1.5 py-0.5 rounded bg-black/25">
                  {user.branchName}
                </span>
              )}
            </div>
            <div className="font-extrabold text-sm text-white truncate mt-1">{user.fullName}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {user.login}</div>

            {user.role === 'STUDENT' && (
              <div className="mt-2.5 p-2 bg-gradient-to-r from-amber-500/25 to-yellow-500/15 border border-amber-400/30 rounded-xl flex items-center justify-between">
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                  <Coins size={14} className="text-amber-400" /> Balans:
                </span>
                <span className="font-black text-amber-300 text-sm">{user.coinBalance ?? 0} coin</span>
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav className="space-y-1 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-300 hover:text-red-400 hover:bg-red-500/15 transition-colors border border-white/5"
          >
            <LogOut size={15} />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </aside>

      {/* 3. Mobile Slide-Over Action Sheet (All Links & Logout) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative z-50 liquid-glass-dark text-white rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-white/20 animate-in slide-in-from-bottom duration-250">
            {/* Sheet pill handle */}
            <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-sm text-white">
                  IT
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{user.fullName}</div>
                  <div className="text-xs text-slate-400 font-mono">ID: {user.login} • {roleNames[user.role]}</div>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* All navigation links grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`ios-press flex items-center gap-2.5 p-3 rounded-2xl text-xs font-semibold ${
                      isActive
                        ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="ios-press w-full py-3.5 px-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={16} />
              <span>Tizimdan chiqish</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-28 md:pb-8 pt-2 md:pt-4 px-3 sm:px-6 md:px-8">
        <div className="max-w-7xl w-full mx-auto">{children}</div>
      </main>

      {/* 5. iOS Docked Liquid Glass Bottom Tab Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 liquid-glass-nav pb-safe pt-1.5 px-3 flex items-center justify-around">
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="ios-press flex-1 flex flex-col items-center justify-center py-1 group relative"
            >
              <div
                className={`h-8 w-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                    : 'text-slate-500 group-hover:text-slate-800'
                }`}
              >
                <Icon size={18} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 font-bold transition-colors ${
                  isActive ? 'text-emerald-700 font-black' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* 5th Tab: Menyu / Action Sheet Trigger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="ios-press flex-1 flex flex-col items-center justify-center py-1 group relative"
          aria-label="Barcha bo'limlar"
        >
          <div className="h-8 w-11 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-slate-800">
            <LayoutGrid size={18} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold text-slate-500">
            Menyu
          </span>
        </button>
      </nav>
    </div>
  );
}
