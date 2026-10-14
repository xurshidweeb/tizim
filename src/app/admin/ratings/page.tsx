'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Award, Trophy, Users, Layers, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

export default function AdminRatingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/student/ratings').then((r) => r.json()),
    ]).then(([uData, rData]) => {
      if (uData.user) setUser(uData.user);
      setRatings(rData);
      setLoading(false);
    });
  }, []);

  if (loading || !user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="text-amber-500" />
            <span>Markaz va Filial Reytinglari</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Spetsifikatsiya 7-bandi: Eng yaxshi guruhlar (ballar o'rtachasi bo'yicha), eng faol o'quvchilar (TOP-7) va davomat ko'rsatkichlari.
          </p>
        </div>

        {/* Center TOP-7 by Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ratings?.centerTop7BySubject?.map((sub: any, idx: number) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Flame className="text-amber-500" size={20} />
                    <h2 className="font-extrabold text-base text-slate-900">{sub.subjectName} — TOP-7</h2>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Faollik</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {sub.top7?.map((st: any, rank: number) => (
                    <div key={rank} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            rank === 0
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-300/40'
                              : rank === 1
                              ? 'bg-slate-200 text-slate-800'
                              : rank === 2
                              ? 'bg-amber-600/20 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{rank + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{st.fullName}</div>
                          <div className="text-xs text-slate-400 font-mono">ID: {st.login}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-sm">{st.score} ball</div>
                        <div className="text-[10px] text-slate-400">Oylik dars bali</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 border-t border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600 shrink-0" />
                <span>Oy oxirida TOP-7 talabalar ota-onalariga avtomatik sertifikat jo'natiladi.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
