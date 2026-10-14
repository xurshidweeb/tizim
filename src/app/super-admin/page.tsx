import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  ShoppingBag, 
  ShieldAlert, 
  History, 
  Coins, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

export default async function SuperAdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/login');

  const [branchesCount, totalStudents, totalStaff, totalOrders, branches] = await Promise.all([
    prisma.branch.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: { in: ['TEACHER', 'ADMIN', 'BRANCH_HEAD'] }, status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.branch.findMany({
      include: {
        _count: {
          select: { users: true, groups: true, orders: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Jami aylanmadagi coinlar
  const totalCoinsResult = await prisma.user.aggregate({
    _sum: { coinBalance: true },
    where: { role: 'STUDENT', status: 'ACTIVE' },
  });
  const totalCoins = totalCoinsResult._sum.coinBalance || 0;

  return (
    <DashboardLayout
      user={{
        fullName: user.fullName,
        login: user.login,
        role: user.role,
      }}
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles size={14} />
              <span>Bosh Ofis • Global Boshqaruv (Super Admin)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Xush kelibsiz, {user.fullName}!</h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              Spetsifikatsiya 1-2 bandi: 12+ filial, 3800+ o'quvchi va 120+ xodimlardan iborat IT Time Academy tarmog'ining to'liq tahliliy nazorati.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/super-admin/branches"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Building2 size={16} />
              <span>Yangi Filial Qo'shish</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Filiallar Soni</span>
              <Building2 size={20} className="text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{branchesCount} ta filial</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">O'sishda davom etmoqda</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Jami O'quvchilar</span>
              <GraduationCap size={20} className="text-teal-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{totalStudents} nafar</div>
            <div className="text-xs text-slate-500 mt-1">Barcha filiallar bo'yicha</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Xodimlar (HR)</span>
              <Users size={20} className="text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{totalStaff} nafar</div>
            <div className="text-xs text-slate-500 mt-1">O'qituvchilar va Adminlar</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Coin Muomalasi</span>
              <Coins size={20} className="text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-500 mt-2">{totalCoins} coin</div>
            <div className="text-xs text-slate-500 mt-1">O'quvchilar hamyonida</div>
          </div>
        </div>

        {/* Branches Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 size={20} className="text-emerald-600" />
              <span>Mavjud Filiallar Ro'yxati</span>
            </h2>
            <Link
              href="/super-admin/branches"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Barchasini ko'rish</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black font-mono">
                      {b.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">Faol</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mt-2">{b.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{b.address || 'Manzil kiritilmagan'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                  <span>{b._count.users} foydalanuvchi</span>
                  <span>•</span>
                  <span>{b._count.groups} ta guruh</span>
                  <span>•</span>
                  <span>{b._count.orders} xarid</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Quick Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/super-admin/penalties"
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Xodimlar Jarima & Bonus Qoidalari</h4>
                <p className="text-xs text-slate-500">Real pulda sozlanadigan qoidalar jadvali (Default: 0 so'm, nofaol)</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400" />
          </Link>

          <Link
            href="/super-admin/audit"
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-xl">
                <History size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Audit Harakatlari Tarixi</h4>
                <p className="text-xs text-slate-500">Qaysi admin kimning ma'lumotini qachon o'zgartirgani jurnali</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
