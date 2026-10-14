'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Award, Trophy, Users, Sparkles, TrendingUp, ShieldCheck, Flame } from 'lucide-react';

export default function StudentRatingsPage() {
  const [user, setUser] = useState<any>(null);
  const [ratingsData, setRatingsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'group' | 'center'>('group');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/student/ratings').then((r) => r.json()),
    ]).then(([userData, ratingData]) => {
      if (userData.user) setUser(userData.user);
      setRatingsData(ratingData);
      setLoading(false);
    });
  }, []);

  if (loading || !user || !ratingsData) return null;

  const { groupRankings, centerTop7BySubject } = ratingsData;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="liquid-glass-emerald rounded-[32px] p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2 border border-white/25">
              <Trophy size={14} className="text-amber-300" />
              <span>Faollik Reytingi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">O'quvchilar Faollik Reytingi</h1>
            <p className="text-emerald-50 text-xs sm:text-sm mt-1 max-w-2xl font-medium leading-relaxed">
              Spetsifikatsiya 7-bandi: Reyting coinlar emas, darslardagi FAOLLIK (davomat + vazifa + faollik ballari) bo'yicha yuritiladi!
            </p>
          </div>

          <div className="flex bg-black/25 p-1 rounded-2xl self-start md:self-auto backdrop-blur-md border border-white/10 relative z-10">
            <button
              onClick={() => setActiveTab('group')}
              className={`ios-press px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'group' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Guruh Ichida
            </button>
            <button
              onClick={() => setActiveTab('center')}
              className={`ios-press px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'center' ? 'bg-white text-slate-900 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              Butun Markaz TOP-7
            </button>
          </div>
        </div>

        {/* Tab 1: Guruh ichidagi to'liq ochiq reyting */}
        {activeTab === 'group' && (
          <div className="space-y-6">
            {groupRankings.map((gr: any) => (
              <div key={gr.groupId} className="liquid-glass-card rounded-[32px] overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{gr.groupName}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-800 text-xs font-black">
                        {gr.subjectName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      Sizning o'rningiz: <b className="text-emerald-600 font-extrabold">{gr.currentUserRank}-o'rin</b> ({gr.totalMembers} nafar o'quvchi orasida)
                    </div>
                  </div>

                  {/* Recommendation badge */}
                  <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500 shrink-0" />
                    <span>{gr.recommendation}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {gr.members.map((member: any, idx: number) => (
                    <div
                      key={member.studentId}
                      className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                        member.isCurrentUser ? 'bg-emerald-50/90 border-l-4 border-emerald-500' : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-9 w-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                            idx === 0
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-400/30'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-700'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{member.fullName}</span>
                            {member.isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                                Siz
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">ID: {member.login}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-slate-900 text-base">{member.activityScore} ball</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Dars faolligi</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Butun Markaz TOP-7 */}
        {activeTab === 'center' && (
          <div className="space-y-6">
            {centerTop7BySubject.map((sub: any, sIdx: number) => (
              <div key={sIdx} className="liquid-glass-card rounded-[32px] overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/40">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Flame className="text-amber-500" size={20} />
                      <span>{sub.subjectName} — Butun Markaz TOP-7</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Barcha filiallardagi shu fanda o'qiydigan eng faol o'quvchilar
                    </p>
                  </div>

                  {sub.advice && (
                    <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-600 shrink-0" />
                      <span>{sub.advice}</span>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {sub.top7.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                        st.isCurrentUser ? 'bg-emerald-50/90 border-l-4 border-emerald-500' : 'hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-9 w-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                            idx === 0
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-400/30'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-700'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{st.fullName}</span>
                            {st.isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                                Siz
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">ID: {st.login}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-base">{st.score} ball</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Oylik Faollik</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
