import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { Layers, CheckSquare, Users, Award, Calendar, ArrowRight, Sparkles, Target } from 'lucide-react';

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TEACHER') redirect('/login');

  const groups = await prisma.group.findMany({
    where: { teacherId: user.id },
    include: {
      subject: true,
      students: { where: { status: 'ACTIVE' } },
      lessons: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });

  const totalStudents = groups.reduce((acc, g) => acc + g.students.length, 0);

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
        {/* Welcome Banner */}
        <div className="liquid-glass-emerald rounded-[32px] p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2 border border-white/25">
              <Sparkles size={14} className="text-amber-300" />
              <span>O'qituvchi Kabineti</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Xush kelibsiz, {user.fullName}!</h1>
            <p className="text-emerald-50 text-xs sm:text-sm mt-1 max-w-xl font-medium leading-relaxed">
              Bugungi darslar davomatini va ballarini o'z vaqtida kiritishni unutmang. Har dars kiritilgan ballar ota-onalarga avtomatik ko'rinadi.
            </p>
          </div>
          <Link
            href="/teacher/attendance"
            className="ios-press inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-3 rounded-2xl font-black text-xs shadow-xl transition-all self-start md:self-auto shrink-0 relative z-10"
          >
            <CheckSquare size={16} />
            <span>Davomat kiritish</span>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="liquid-glass-card p-5 rounded-[28px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Mening Guruhlarim</span>
              <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Layers size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{groups.length} ta guruh</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Faol dars jarayonida</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Jami O'quvchilar</span>
              <div className="p-2 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <Users size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{totalStudents} nafar</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Barcha guruhlar bo'yicha</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Oylik Davomat</span>
              <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
                <Award size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mt-3">92.4%</div>
            <div className="text-xs text-emerald-600 font-bold mt-1">Filialda TOP-3 o'rinda</div>
          </div>
        </div>

        {/* Groups List */}
        <div className="liquid-glass-card rounded-[32px] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-emerald-600" />
              <span>Guruhlarim ro'yxati</span>
            </h2>
            <Link
              href="/teacher/attendance"
              className="ios-press text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
            >
              <span>Davomatga o'tish</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-900 text-lg">{group.name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300/60">
                      {group.subject.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />{' '}
                      {group.scheduleType === 'ODD'
                        ? 'Toq kunlar (Dush-Chor-Jum)'
                        : 'Juft kunlar (Sesh-Pay-Shan)'}
                    </span>
                    <span>•</span>
                    <span>Vaqti: {group.lessonTime}</span>
                    {group.room && (
                      <>
                        <span>•</span>
                        <span>{group.room}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <div className="text-right mr-2 hidden sm:block">
                    <div className="text-[11px] text-slate-400">O'quvchilar</div>
                    <div className="font-extrabold text-slate-800 text-xs">{group.students.length} nafar</div>
                  </div>
                  <Link
                    href={`/teacher/attendance?groupId=${group.id}`}
                    className="ios-press px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-emerald-200"
                  >
                    <CheckSquare size={14} />
                    <span>Davomat</span>
                  </Link>
                  <Link
                    href={`/teacher/monthly?groupId=${group.id}`}
                    className="ios-press px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <Target size={14} />
                    <span>110 Ball</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
