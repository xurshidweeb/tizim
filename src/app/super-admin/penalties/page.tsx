'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ShieldAlert, Plus, CheckCircle2, AlertCircle, Save, Info, Sparkles } from 'lucide-react';

export default function SuperAdminPenaltiesPage() {
  const [user, setUser] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState('');

  const loadData = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/super-admin/penalties').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (pRes.rules) setRules(pRes.rules);
      if (pRes.logs) setLogs(pRes.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRuleFieldChange = (ruleId: string, field: string, value: any) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRule = async (rule: any) => {
    setSavingId(rule.id);
    setSuccessToast('');

    try {
      const res = await fetch('/api/super-admin/penalties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: rule.id,
          amountUzSum: rule.amountUzSum,
          threshold: rule.threshold,
          isActive: rule.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Saqlashda xatolik');

      setSuccessToast(`"${rule.title}" qoidasi muvaffaqiyatli saqlandi!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-amber-500" />
              <span>Xodimlar Uchun Jarima & Bonus Qoidalari</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Spetsifikatsiya 6-bandi: Real pulda (so'm), dastur kodini o'zgartirmasdan boshqariladigan dinamik qoidalar tizimi.
            </p>
          </div>
        </div>

        {/* Critical Specification Notice */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold">Muhim spetsifikatsiya talabi:</span> Yangi qoidalar default holatda <span className="underline font-bold">nofaol va 0 so'm</span> bo'ladi. Tasodifiy summa hech kimning haqiqiy maoshidan yechilib ketmasligi uchun, faqat Super-admin yoki Filial boshlig'i ongli ravishda faollashtirgandan keyin ishga tushadi.
          </div>
        </div>

        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Rules Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900">Faol va Nofaol Qoidalar Ro'yxati</h2>
            <span className="text-xs text-slate-500">{rules.length} ta sozlama</span>
          </div>

          <div className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <div key={rule.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="max-w-md">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        rule.type === 'BONUS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rule.type === 'BONUS' ? 'Rag\'bat (Bonus)' : 'Jarima'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                      Rol: {rule.targetRole}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1.5">{rule.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                </div>

                {/* Configuration Controls */}
                <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Summa (so'mda)
                    </label>
                    <input
                      type="number"
                      step={5000}
                      value={rule.amountUzSum}
                      onChange={(e) =>
                        handleRuleFieldChange(rule.id, 'amountUzSum', e.target.value)
                      }
                      className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {rule.threshold !== null && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Chegara (%)
                      </label>
                      <input
                        type="number"
                        step={1}
                        value={rule.threshold}
                        onChange={(e) =>
                          handleRuleFieldChange(rule.id, 'threshold', e.target.value)
                        }
                        className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Holati
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        handleRuleFieldChange(rule.id, 'isActive', !rule.isActive)
                      }
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        rule.isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rule.isActive ? 'Faol' : 'Nofaol'}
                    </button>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      disabled={savingId === rule.id}
                      onClick={() => handleSaveRule(rule)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Save size={14} />
                      <span>{savingId === rule.id ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
