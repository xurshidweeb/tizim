'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Target, Award, CheckCircle, AlertTriangle, Coins, Sparkles, ArrowRight, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

function TeacherMonthlyContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [results, setResults] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });

    fetch('/api/teacher/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.groups) {
          setGroups(data.groups);
          if (!selectedGroupId && data.groups.length > 0) {
            setSelectedGroupId(data.groups[0].id);
          }
        }
      });
  }, []);

  const loadMonthlyData = async (groupId: string) => {
    if (!groupId) return;
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/teacher/monthly?groupId=${groupId}`);
      const data = await res.json();
      setResults(data.results || []);
      setGroupName(data.groupName || '');
      setSubjectName(data.subjectName || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      loadMonthlyData(selectedGroupId);
    }
  }, [selectedGroupId]);

  const handleFinalize = async () => {
    if (!selectedGroupId || !confirm('Ushbu guruh bo\'yicha oylik hisobni yakunlab, barcha 110 dan o\'tgan ballar va davomat bonuslarini o\'quvchilar doimiy hamyoniga o\'tkazishni tasdiqlaysizmi?')) {
      return;
    }

    setFinalizing(true);
    try {
      const res = await fetch('/api/teacher/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedGroupId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        loadMonthlyData(selectedGroupId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFinalizing(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      user={{
        fullName: user.fullName,
        login: user.login,
        role: user.role,
        branchName: user.branchName,
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
                <Target size={24} />
              </span>
              <span>Oylik 110 Ball Chegarasi va Natijalar</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Spetsifikatsiya 4.3-bandi: 12 dars + imtihon jami 110 ballga yetsa — barcha ball doimiy balansga aylanadi. 110 ga yetmasa — 0 ga tushadi.
            </p>
          </div>

          <button
            onClick={handleFinalize}
            disabled={finalizing || results.length === 0}
            className="ios-press px-5 py-3 rounded-2xl liquid-glass-gold text-slate-950 font-black text-xs shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
          >
            <Coins size={18} className="text-amber-950" />
            <span>{finalizing ? 'O\'tkazilmoqda...' : 'Oyni Yakunlash & Coinlarni Berish'}</span>
          </button>
        </div>

        {/* Group Selector */}
        <div className="liquid-glass-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Guruhni tanlang</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.subject.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span>Tanlangan guruh:</span>
            <span className="px-3 py-1 bg-emerald-100/80 border border-emerald-300/60 text-emerald-800 rounded-full font-black">
              {groupName} • {subjectName}
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Rules Reminder Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="liquid-glass-card p-5 rounded-[28px] text-xs space-y-1.5">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
              <Sparkles size={16} className="text-amber-500" /> 110 Ball Asosiy Qoidasi:
            </div>
            <div className="text-slate-600 leading-relaxed">
              • O'quvchi oy davomida (12 dars + imtihon) jami <span className="font-bold text-slate-900">110 ball</span> to'plasa, barcha to'plagan bali (masalan 130 ball) doimiy coin balansiga aylanadi.
            </div>
            <div className="text-slate-600 leading-relaxed">
              • Agar <span className="font-bold text-red-600">110 dan kam</span> bo'lsa, ballar keyingi oyga o'tmaydi va 0 ga tushadi.
            </div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px] text-xs space-y-1.5">
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
              <Award size={16} className="text-emerald-600" /> Davomat Bonusi (Mustaqil):
            </div>
            <div className="text-slate-600 leading-relaxed">
              • 12 ta darsning barchasiga kelish: <span className="font-bold text-emerald-700">+100 coin</span>
            </div>
            <div className="text-slate-600 leading-relaxed">
              • 11 taga kelish: <span className="font-bold text-emerald-700">+80 coin</span> | 10 taga kelish: <span className="font-bold text-emerald-700">+60 coin</span>
            </div>
            <div className="text-slate-500 italic text-[11px]">
              * Davomat bonusi 110 ball yetmagan taqdirda ham to'liq kafolatlangan!
            </div>
          </div>
        </div>

        {/* 1. Mobile iOS Liquid Glass Evaluation Cards (<768px) */}
        <div className="md:hidden space-y-3">
          {results.length === 0 ? (
            <div className="liquid-glass-card p-8 rounded-3xl text-center text-slate-400 text-xs font-medium">
              Ma'lumotlar topilmadi
            </div>
          ) : (
            results.map((row) => (
              <div key={row.studentId} className="liquid-glass-card p-4 rounded-3xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{row.fullName}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: {row.login} • Balans: {row.currentWallet} coin
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Jami Coin</div>
                    <div className="font-black text-base text-amber-500">+{row.totalPossibleCoins}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Davomat:</span>{' '}
                    <b className="text-slate-800">{row.attendedCount}/12</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Darslar:</span>{' '}
                    <b className="text-slate-800">{row.regularScore} ball</b>
                  </div>
                  <div>
                    <span className="text-slate-500">Imtihon:</span>{' '}
                    <b className="text-slate-800">{row.examScore} ball</b>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900">{row.grandTotal} / 110 ball</span>
                  </div>

                  <div>
                    {row.passed110 ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-extrabold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle size={12} /> O'tdi (+{row.coinsEarnedFromPoints})
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full font-extrabold text-[11px] inline-flex items-center gap-1">
                        <AlertTriangle size={12} /> -{row.deficitFor110} ball
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. Desktop Full Table (Katta ekranlar) */}
        <div className="hidden md:block liquid-glass-card rounded-[32px] overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">O'quvchilar Oylik Ko'rsatkichi</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">O'quvchi</th>
                  <th className="p-4 text-center">Davomat (12 ta)</th>
                  <th className="p-4 text-center">12 Dars Balli</th>
                  <th className="p-4 text-center">Imtihon Balli</th>
                  <th className="p-4 text-center">Jami Yig'indi</th>
                  <th className="p-4 text-center">110 Chegarasi</th>
                  <th className="p-4 text-center">Davomat Bonusi</th>
                  <th className="p-4 text-right">Beriladigan Jami Coin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((row) => (
                  <tr key={row.studentId} className="hover:bg-white/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{row.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        ID: {row.login} • Balans: {row.currentWallet} coin
                      </div>
                    </td>

                    <td className="p-4 text-center font-bold text-slate-700">
                      {row.attendedCount} / 12 ta
                    </td>

                    <td className="p-4 text-center font-semibold text-slate-800">
                      {row.regularScore} ball
                    </td>

                    <td className="p-4 text-center font-semibold text-slate-800">
                      {row.examScore} ball
                    </td>

                    <td className="p-4 text-center font-black text-base text-slate-900">
                      {row.grandTotal} ball
                    </td>

                    <td className="p-4 text-center">
                      {row.passed110 ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle size={13} /> O'tdi (+{row.coinsEarnedFromPoints})
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full font-bold text-xs inline-flex items-center gap-1">
                          <AlertTriangle size={13} /> Yetmadi (-{row.deficitFor110} ball)
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {row.attendanceBonusCoins > 0 ? (
                        <span className="font-bold text-emerald-600">
                          +{row.attendanceBonusCoins} coin
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0 coin</span>
                      )}
                    </td>

                    <td className="p-4 text-right font-black text-base text-amber-500">
                      +{row.totalPossibleCoins} coin
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

export default function TeacherMonthlyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>}>
      <TeacherMonthlyContent />
    </Suspense>
  );
}
