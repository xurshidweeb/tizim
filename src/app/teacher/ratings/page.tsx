import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import { Award, Trophy, Users, Star, CheckCircle } from 'lucide-react';

export default async function TeacherRatingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TEACHER') redirect('/login');

  // O'qituvchilar ro'yxati va ularning o'rtacha davomat foizi
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', status: 'ACTIVE' },
    include: {
      branch: true,
      taughtGroups: {
        include: {
          subject: true,
          lessons: {
            include: { attendances: true },
          },
        },
      },
    },
  });

  const rankedTeachers = teachers.map((t) => {
    let totalExpected = 0;
    let totalPresent = 0;

    t.taughtGroups.forEach((g) => {
      g.lessons.forEach((l) => {
        l.attendances.forEach((att) => {
          totalExpected++;
          if (att.isPresent) totalPresent++;
        });
      });
    });

    const rate = totalExpected > 0 ? (totalPresent / totalExpected) * 100 : 85.0;

    return {
      id: t.id,
      name: t.fullName,
      login: t.login,
      branchName: t.branch?.name || 'Urganch',
      groupsCount: t.taughtGroups.length,
      attendanceRate: Math.round(rate * 10) / 10,
      isCurrentUser: t.id === user.id,
    };
  });

  rankedTeachers.sort((a, b) => b.attendanceRate - a.attendanceRate);

  return (
    <DashboardLayout
      user={{
        fullName: user.fullName,
        login: user.login,
        role: user.role,
        branchName: user.branch?.name,
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="text-amber-500" />
            <span>O'qituvchilar Reytingi</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Spetsifikatsiya 7-bandi: Joriy davomat foizi bo'yicha filial ichida TOP-10, markaz bo'yicha TOP-10 va fan bo'yicha TOP-5.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-emerald-600" />
              <span>Markaz bo'yicha Davomat Reytingi</span>
            </h2>
            <span className="text-xs text-slate-500">Oy davomida avtomatik yangilanadi</span>
          </div>

          <div className="divide-y divide-slate-100">
            {rankedTeachers.map((item, index) => (
              <div
                key={item.id}
                className={`p-5 flex items-center justify-between transition-colors ${
                  item.isCurrentUser ? 'bg-emerald-50/70 border-l-4 border-emerald-500' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      index === 0
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-300/40'
                        : index === 1
                        ? 'bg-slate-200 text-slate-800'
                        : index === 2
                        ? 'bg-amber-600/30 text-amber-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                          Siz
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      Filial: {item.branchName} • {item.groupsCount} ta guruh
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600">{item.attendanceRate}%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Davomat ko'rsatkichi</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
