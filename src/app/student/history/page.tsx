'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Coins, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

export default function StudentCoinHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        if (data.recentTransactions) setTransactions(data.recentTransactions);
        setLoading(false);
      });
  }, []);

  if (loading || !user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <History size={24} />
              </span>
              <span>Coin Operatsiyalari Shaffof Tarixi</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Spetsifikatsiya 9-bandi: O'quvchi nima uchun qancha coin olgani yoki sarflaganini to'liq ko'radi.
            </p>
          </div>

          <div className="px-5 py-2.5 rounded-2xl liquid-glass-gold flex items-center gap-2 self-start sm:self-auto shadow-lg text-slate-950">
            <Coins size={20} className="text-amber-950" />
            <span className="font-black text-amber-950 text-sm">Jami: {user.coinBalance} coin</span>
          </div>
        </div>

        <div className="liquid-glass-card rounded-[32px] overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">
              Hozircha birorta ham coin tranzaksiyasi amalga oshirilmagan.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;

                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isPositive
                            ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-300/60'
                            : 'bg-red-100/80 text-red-600 border border-red-300/60'
                        }`}
                      >
                        {isPositive ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{tx.description}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium">
                          {new Date(tx.createdAt).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-black text-base sm:text-lg ${
                          isPositive ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? `+${tx.amount}` : tx.amount} coin
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {tx.type}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
