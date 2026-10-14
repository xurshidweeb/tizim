'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileSpreadsheet, Download, Search, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminImportExportPage() {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/admin/students').then((r) => r.json()),
    ]).then(([uRes, sRes]) => {
      if (uRes.user) setUser(uRes.user);
      if (sRes.students) setStudents(sRes.students);
      setLoading(false);
    });
  }, []);

  if (loading || !user) return null;

  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.login.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-600" />
              <span>Loginlar Jadvali & Excel Eksport</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Spetsifikatsiya 10-bandi: Admin va o'qituvchilar login/parollar ro'yxatini to'g'ridan-to'g'ri saytda ko'rishlari va Excel (.xlsx) qilib yuklab olishlari mumkin.
            </p>
          </div>

          <a
            href="/api/admin/export-logins"
            download
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Download size={16} />
            <span>Excel Faylni Yuklab Olish</span>
          </a>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki logini bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Login / ID</th>
                  <th className="p-4">F.I.Sh</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Filial</th>
                  <th className="p-4">To'lov Turi</th>
                  <th className="p-4 text-center">Standart Parol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-700">
                      {s.login}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {s.fullName}
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {s.phone || '-'}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600">
                      {s.branch?.name || '-'}
                    </td>
                    <td className="p-4 text-xs">
                      {s.studentType === 'STATE_RESERVE' ? 'Davlat rezervi' : 'Pullik'}
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-slate-500">
                      •••••••• (password123)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
