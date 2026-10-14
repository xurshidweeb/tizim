'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { CheckSquare, CheckCircle2, XCircle, Search, Filter, AlertTriangle, BookOpen, User } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [user, setUser] = useState<any>(null);
  const [studentGroups, setStudentGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/admin/payments').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (pRes.studentGroups) setStudentGroups(pRes.studentGroups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePayment = async (sgId: string, currentPaid: boolean) => {
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentGroupId: sgId,
          isPaid: !currentPaid,
        }),
      });

      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  const filtered = studentGroups.filter((sg) => {
    const s = sg.student;
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.login.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'PAID') return matchesSearch && sg.monthlyTuitionPaid;
    if (statusFilter === 'UNPAID') return matchesSearch && !sg.monthlyTuitionPaid && s.studentType === 'PAID';
    if (statusFilter === 'RESERVE') return matchesSearch && s.studentType === 'STATE_RESERVE';
    return matchesSearch;
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckSquare size={24} />
              </span>
              <span>Oylik To'lovlar (Tuition) Nazorati</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Spetsifikatsiya 5-bandi: Pullik va Davlat rezervi (bepul) o'quvchilar ro'yxati, to'lovni qo'lda qayd etish.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="liquid-glass-card p-3 sm:p-4 rounded-3xl flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="O'quvchi ismi yoki ID raqami..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 ios-glass-input rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-bold text-slate-500">Holat:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 ios-glass-input rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Barchasi ({studentGroups.length})</option>
              <option value="UNPAID">To'lamaganlar (Qarzdorlar)</option>
              <option value="PAID">To'laganlar</option>
              <option value="RESERVE">Davlat rezervi (bepul)</option>
            </select>
          </div>
        </div>

        {/* 1. Mobile iOS Cards List (Ekran < 768px) */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="liquid-glass-card p-8 rounded-3xl text-center text-slate-400 text-xs font-medium">
              To'lov ma'lumotlari topilmadi
            </div>
          ) : (
            filtered.map((sg) => {
              const isReserve = sg.student.studentType === 'STATE_RESERVE';
              const isPaid = sg.monthlyTuitionPaid;

              return (
                <div key={sg.id} className="liquid-glass-card p-4 rounded-3xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{sg.student.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        ID: {sg.student.login} • {sg.student.phone || 'Tel: yo\'q'}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        isReserve
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isReserve ? 'Davlat rezervi' : 'Pullik'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                      <BookOpen size={13} className="text-slate-400 shrink-0" />
                      <span>{sg.group.name}</span>
                      <span className="text-slate-400 font-normal">({sg.group.subject.name})</span>
                    </div>

                    {isReserve ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        Ozod etilgan
                      </span>
                    ) : isPaid ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 size={12} /> To'langan
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-extrabold text-[11px] inline-flex items-center gap-1">
                        <AlertTriangle size={12} /> Qarzdor
                      </span>
                    )}
                  </div>

                  {!isReserve && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleTogglePayment(sg.id, isPaid)}
                        className={`ios-press w-full min-h-[42px] py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          isPaid
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/25'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <XCircle size={15} />
                            <span>To'lovni bekor qilish</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} />
                            <span>To'lovni tasdiqlash</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop Full Table (Katta ekranlar) */}
        <div className="hidden md:block liquid-glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">O'quvchi</th>
                  <th className="p-4">Guruh & Fan</th>
                  <th className="p-4 text-center">Ta'lim Turi</th>
                  <th className="p-4 text-center">Joriy Oy To'lovi</th>
                  <th className="p-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sg) => {
                  const isReserve = sg.student.studentType === 'STATE_RESERVE';
                  const isPaid = sg.monthlyTuitionPaid;

                  return (
                    <tr key={sg.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{sg.student.fullName}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {sg.student.login} • Tel: {sg.student.phone || 'yo\'q'}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-xs">{sg.group.name}</div>
                        <div className="text-[11px] text-slate-400">{sg.group.subject.name}</div>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isReserve
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isReserve ? 'Davlat rezervi' : 'Pullik'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {isReserve ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                            Ozod etilgan
                          </span>
                        ) : isPaid ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs inline-flex items-center gap-1">
                            <CheckCircle2 size={13} /> To'langan
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-extrabold text-xs inline-flex items-center gap-1">
                            <AlertTriangle size={13} /> To'lanmagan
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {!isReserve && (
                          <button
                            onClick={() => handleTogglePayment(sg.id, isPaid)}
                            className={`ios-press px-4 py-2 rounded-2xl font-bold text-xs transition-colors ${
                              isPaid
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                            }`}
                          >
                            {isPaid ? 'Bekor qilish' : 'To\'lovni tasdiqlash'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
