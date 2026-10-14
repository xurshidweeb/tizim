import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  Users, 
  GraduationCap, 
  Layers, 
  ShoppingBag, 
  CheckSquare, 
  ArrowRight, 
  Coins, 
  Clock, 
  AlertTriangle,
  Building2,
  Sparkles
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    redirect('/login');
  }

  const branchFilter = user.role !== 'SUPER_ADMIN' && user.branchId ? { branchId: user.branchId } : {};

  const [studentsCount, groupsCount, pendingOrdersCount, unpaidStudentsCount] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE', ...branchFilter } }),
    prisma.group.count({ where: { status: 'ACTIVE', ...branchFilter } }),
    prisma.order.count({ where: { status: 'PENDING', ...branchFilter } }),
    prisma.studentGroup.count({
      where: {
        monthlyTuitionPaid: false,
        student: { studentType: 'PAID', status: 'ACTIVE' },
        ...(user.role !== 'SUPER_ADMIN' && user.branchId ? { group: { branchId: user.branchId } } : {}),
      },
    }),
  ]);

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
        {/* iOS Liquid Glass Dark Hero Header */}
        <div className="liquid-glass-dark rounded-[32px] p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Building2 size={13} />
              <span>{user.branch?.name || 'Barcha filiallar'} • Boshqaruv Markazi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Xush kelibsiz, {user.fullName}!</h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Filial o'quvchilari, to'lovlar, yangi loginlar va Coin Market buyurtmalarini boshqarish markazi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto relative z-10">
            <Link
              href="/admin/students"
              className="ios-press px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <GraduationCap size={16} />
              <span>+ O'quvchi qo'shish</span>
            </Link>
            <Link
              href="/admin/orders"
              className="ios-press px-4 py-2.5 rounded-2xl liquid-glass-gold text-amber-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <ShoppingBag size={16} />
              <span>Buyurtmalar ({pendingOrdersCount})</span>
            </Link>
          </div>
        </div>

        {/* 4 iOS Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="liquid-glass-card p-5 rounded-[28px] transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Faol O'quvchilar</span>
              <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <GraduationCap size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{studentsCount} nafar</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Filial bo'yicha</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px] transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Faol Guruhlar</span>
              <div className="p-2 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                <Layers size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-3">{groupsCount} ta guruh</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Dars jadvalida</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px] transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Kutilayotgan Buyurtmalar</span>
              <div className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/20">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600 mt-3">{pendingOrdersCount} ta</div>
            <div className="text-xs text-amber-600 font-semibold mt-1">Topshirilishi kutilmoqda</div>
          </div>

          <div className="liquid-glass-card p-5 rounded-[28px] transition-all">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">To'lov qilmaganlar</span>
              <div className="p-2 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-red-600 mt-3">{unpaidStudentsCount} nafar</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Eslatma yuborish lozim</div>
          </div>
        </div>

        {/* Quick Navigation grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/admin/students"
            className="ios-press p-6 liquid-glass-card rounded-[28px] hover:border-emerald-400/80 transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <GraduationCap size={24} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mt-4 flex items-center justify-between">
              <span>O'quvchilar Boshqaruvi</span>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              Avtomatik login yaratish (masalan URG-0231), guruhlarga kiritish, chiqib ketganlarni belgilash.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="ios-press p-6 liquid-glass-card rounded-[28px] hover:border-amber-400/80 transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mt-4 flex items-center justify-between">
              <span>Coin Market Buyurtmalari</span>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              O'quvchilar xarid qilgan sovg'alarni tasdiqlash, topshirish yoki bekor qilib coinni qaytarish.
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="ios-press p-6 liquid-glass-card rounded-[28px] hover:border-teal-400/80 transition-all group"
          >
            <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <CheckSquare size={24} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg mt-4 flex items-center justify-between">
              <span>Oylik To'lovlar Nazorati</span>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              Pullik va Davlat rezervi o'quvchilari ro'yxati va ularning oylik to'lov holatini belgilash.
            </p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
