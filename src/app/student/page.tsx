'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  Coins, 
  Target, 
  ShoppingBag, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Clock,
  Gift
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-100/70 flex items-center justify-center text-slate-500 font-bold">
        Yuklanmoqda...
      </div>
    );
  }

  const { user, subjectsProgress, goal, recentTransactions } = data;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Top Hero Banner & Wallet Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Big Golden Liquid Glass Wallet Card */}
          <div className="lg:col-span-1 liquid-glass-gold rounded-[32px] p-6 text-slate-950 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute -right-6 -bottom-6 opacity-25 pointer-events-none">
              <Coins size={170} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-950/70">
                  Doimiy Balans
                </span>
                <span className="px-3 py-1 rounded-full bg-black/10 backdrop-blur-md text-amber-950 text-xs font-black">
                  IT Time Coin
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight">{user.coinBalance}</span>
                <span className="text-xl font-bold text-amber-950">coin</span>
              </div>

              <p className="text-xs text-amber-950/80 font-medium mt-2 leading-relaxed">
                Bu sizning tasdiqlangan va marketda mahsulotlarga erkin sarflashingiz mumkin bo'lgan tangalaringiz.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-950/15">
              <Link
                href="/student/market"
                className="ios-press w-full min-h-[44px] py-3 px-4 bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                <span>Coin Market Do'koni</span>
              </Link>
            </div>
          </div>

          {/* Goal Wishlist Card */}
          <div className="lg:col-span-2 liquid-glass-card rounded-[32px] p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
                  <Target size={22} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Mening Maqsadim (Goal)</h3>
                  <p className="text-xs text-slate-500">Do'kondan o'zingiz xohlagan mahsulotga coin to'plang</p>
                </div>
              </div>

              <Link
                href="/student/market"
                className="ios-press text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>{goal ? "O'zgartirish" : "Maqsad tanlash"}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {goal ? (
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/70 border border-white/80 shadow-sm">
                <img
                  src={goal.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300'}
                  alt={goal.productName}
                  className="w-20 h-20 object-cover rounded-2xl shadow-sm border border-slate-200 shrink-0"
                />
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">{goal.productName}</span>
                    <span className="font-black text-xs sm:text-sm text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {goal.priceCoins} coin
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden mt-2.5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
                    <span>To'plangan: <b>{user.coinBalance}</b> / {goal.priceCoins} coin</span>
                    <span className="font-bold text-emerald-600">
                      {goal.remainingCoins === 0
                        ? "🎉 Yetarli! Do'kondan xarid qiling!"
                        : `Yana ${goal.remainingCoins} coin qoldi`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 p-6 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center">
                <Gift className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-xs text-slate-600 font-medium">Hozircha hech qanday maqsad belgilanmagan.</p>
                <Link
                  href="/student/market"
                  className="ios-press mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-colors"
                >
                  Do'kondan mahsulot tanlash
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Subjects Monthly Progress (110 Rule) */}
        <div className="liquid-glass-card rounded-[32px] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                <span>Oylik Fan Progressi (110 Ball Chegarasi)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Spetsifikatsiya 4.3: Har fan alohida hisoblanadi. Oy davomida 110 ballga yetsa — barcha ball umumiy balansga qo'shiladi!
              </p>
            </div>
            <Link
              href="/student/ratings"
              className="ios-press text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Reytingni ko'rish</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectsProgress.map((sub: any) => {
              const progressPercent = Math.min(100, Math.round((sub.grandTotal / 110) * 100));

              return (
                <div
                  key={sub.groupId}
                  className="p-5 rounded-2xl bg-white/70 border border-white/80 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-base">{sub.subjectName}</span>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {sub.groupName} • Ustoz: {sub.teacherName}
                        </div>
                      </div>

                      {sub.passed110 ? (
                        <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full font-black text-xs inline-flex items-center gap-1">
                          <CheckCircle2 size={13} /> 110 Dan O'tdi!
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 rounded-full font-bold text-xs inline-flex items-center gap-1">
                          <Clock size={13} /> Yana {sub.deficitFor110} ball
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                        <span>Joriy ball: {sub.grandTotal} / 110 ball</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            sub.passed110 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                      <span>12 ta darsdan: <b className="text-slate-800">{sub.regularScore} ball</b></span>
                      <span>Imtihon: <b className="text-slate-800">{sub.examScore} ball</b></span>
                    </div>
                  </div>

                  {/* Attendance bonus alert for this subject */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Davomat: <b className="text-slate-900">{sub.attendedLessons} / {sub.totalLessons} dars</b>
                    </span>
                    <span className="font-bold text-emerald-700">
                      {sub.attendanceBonusEarned > 0
                        ? `+${sub.attendanceBonusEarned} bonus coin kafolatlandi!`
                        : '10+ darsga kelib bonus oling'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Coin Transactions */}
        <div className="liquid-glass-card rounded-[32px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              <span>Coin Operatsiyalari Tarixi</span>
            </h3>
            <Link
              href="/student/history"
              className="ios-press text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Hammasini ko'rish</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">Hozircha o'tkazmalar mavjud emas</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx: any) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{tx.description}</div>
                    <div className="text-slate-400 text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                  <div
                    className={`font-black text-sm ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} coin
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
