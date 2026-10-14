import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Layers, 
  ShoppingBag, 
  ShieldAlert, 
  Award, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default async function BranchHeadDashboardPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    redirect('/login');
  }

  const branchId = user.branchId;

  const [branch, studentsCount, teachersCount, groupsCount, ordersCount] = await Promise.all([
    branchId ? prisma.branch.findUnique({ where: { id: branchId } }) : null,
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE', ...(branchId ? { branchId } : {}) } }),
    prisma.user.count({ where: { role: 'TEACHER', status: 'ACTIVE', ...(branchId ? { branchId } : {}) } }),
    prisma.group.count({ where: { status: 'ACTIVE', ...(branchId ? { branchId } : {}) } }),
    prisma.order.count({ where: branchId ? { branchId } : {} }),
  ]);

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', status: 'ACTIVE', ...(branchId ? { branchId } : {}) },
    include: {
      taughtGroups: {
        include: { subject: true },
      },
    },
  });

  return (
    <DashboardLayout
      user={{
        fullName: user.fullName,
        login: user.login,
        role: user.role,
        branchName: branch?.name,
      }}
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="liquid-glass-dark rounded-[32px] p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2 border border-white/20">
              <Building2 size={14} className="text-emerald-300" />
              <span>{branch?.name || 'Filial'} • Rahbar Paneli</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user.fullName}</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Spetsifikatsiya 2-bandi: Admin bilan operatsion teng huquq + Filial moliyaviy va HR/o'qituvchilar nazorati.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto relative z-10">
            <Link
              href="/admin/students"
              className="ios-press px-5 py-2.5 rounded-2xl bg-white text-emerald-950 hover:bg-slate-100 font-bold text-xs shadow-xl transition-all flex items-center gap-1.5"
            >
              <GraduationCap size={16} />
              <span>O'quvchilar Boshqaruvi</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="liquid-glass-card p-5 rounded-[28px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Filial O'quvchilari</span>
              <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <GraduationCap size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{studentsCount} nafar</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Faol ta'lim olmoqda</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">O'qituvchilar (HR)</span>
              <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Users size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{teachersCount} nafar</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Guruhlar biriktirilgan</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Faol Guruhlar</span>
              <div className="p-2 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <Layers size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{groupsCount} ta</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Dars jadvalida</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px]">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Market Buyurtmalari</span>
              <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{ordersCount} ta</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Coin Market orqali</div>
          </div>
        </div>

        {/* Teachers list and management */}
        <div className="liquid-glass-card rounded-[32px] overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-emerald-600" />
              <span>Filial O'qituvchilari (HR Nazorati)</span>
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {teachers.map((t) => (
              <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-slate-900 text-base">{t.fullName}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {t.login} • Tel: {t.phone || 'yo\'q'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {t.taughtGroups.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 font-bold text-xs"
                    >
                      {g.name} ({g.subject.name})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/super-admin/penalties"
            className="ios-press p-5 liquid-glass-card rounded-[28px] hover:border-amber-400/80 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shadow-sm">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Filial Jarima & Bonuslari</h4>
                <p className="text-xs text-slate-500 font-medium">Davomat qoldirish va chiqib ketgan o'quvchilar bo'yicha hisob</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
          </Link>

          <Link
            href="/admin/payments"
            className="ios-press p-5 liquid-glass-card rounded-[28px] hover:border-teal-400/80 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl shadow-sm">
                <TrendingUp size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">To'lovlar & Qarzdorlik</h4>
                <p className="text-xs text-slate-500 font-medium">Filialdagi to'lamagan o'quvchilar monitoringi</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
