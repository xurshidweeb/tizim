'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { History, ShieldCheck, Search, Clock, UserCheck } from 'lucide-react';

export default function SuperAdminAuditPage() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/super-admin/audit').then((r) => r.json()),
    ]).then(([uRes, aRes]) => {
      if (uRes.user) setUser(uRes.user);
      if (aRes.logs) setLogs(aRes.logs);
      setLoading(false);
    });
  }, []);

  if (loading || !user) return null;

  const filtered = logs.filter((l) =>
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <History className="text-teal-600" />
              <span>Audit va Shaffoflik Jurnali</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Spetsifikatsiya 9-bandi: Qaysi xodim yoki admin qachon qaysi ma'lumotni o'zgartirganini to'liq ko'rish jurnali.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Harakat turi, admin ismi yoki tafsilotlar bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none"
          />
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Hozircha audit yozuvlari mavjud emas.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600 mt-0.5">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{log.user.fullName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {log.user.role}
                        </span>
                        {log.user.branch && (
                          <span className="text-xs text-slate-400 font-medium">({log.user.branch.name})</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 font-medium mt-1">
                        {log.details}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800">
                      {log.action}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1 font-mono">
                      <Clock size={12} />
                      <span>{new Date(log.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
