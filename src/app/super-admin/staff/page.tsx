'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, UserPlus, Search, Phone, Building2, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

export default function SuperAdminStaffPage() {
  const [user, setUser] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [login, setLogin] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [branchId, setBranchId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/super-admin/staff').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (sRes.staff) setStaff(sRes.staff);
      if (sRes.branches) {
        setBranches(sRes.branches);
        if (sRes.branches.length > 0) setBranchId(sRes.branches[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const res = await fetch('/api/super-admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, login, phone, role, branchId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');

      alert(data.message);
      setIsModalOpen(false);
      setFullName('');
      setLogin('');
      setPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading || !user) return null;

  const filtered = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.login.toLowerCase().includes(search.toLowerCase()) ||
      (s.branch?.name && s.branch.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="text-emerald-600" />
              <span>Xodimlar (HR) Boshqaruvi</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Barcha filiallar bo'yicha o'qituvchilar, filial boshliqlari va adminlar ro'yxati.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <UserPlus size={16} />
            <span>Yangi Xodim Qo'shish</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center">
          <Search size={18} className="text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Xodim ismi, logini yoki filiali bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none"
          />
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Xodim</th>
                  <th className="p-4">Roli</th>
                  <th className="p-4">Filial</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Biriktirilgan Guruhlar</th>
                  <th className="p-4 text-center">Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{s.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono">Login: {s.login}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        {s.role}
                      </span>
                    </td>

                    <td className="p-4 text-xs font-semibold text-slate-700">
                      {s.branch?.name || 'Global (Filialsiz)'}
                    </td>

                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {s.phone || '-'}
                    </td>

                    <td className="p-4">
                      {s.taughtGroups?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {s.taughtGroups.map((g: any) => (
                            <span key={g.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        Faol
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <UserPlus className="text-emerald-600" size={20} />
                  <span>Yangi Xodim Qo'shish</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Ism va Familiya</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan: Nodir Alimov"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Login (Foydalanuvchi nomi)</label>
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Masalan: URG-T03 yoki CHIL-ADMIN"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Roli</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TEACHER">O'qituvchi</option>
                    <option value="ADMIN">Filial Admini</option>
                    <option value="BRANCH_HEAD">Filial Boshlig'i</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Filial</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Telefon Raqami</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                  >
                    {modalLoading ? 'Qo\'shilmoqda...' : 'Xodimni Qo\'shish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
