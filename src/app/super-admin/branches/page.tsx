'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Building2, Plus, X, CheckCircle2, Phone, MapPin, Users, Layers, ShoppingBag } from 'lucide-react';

export default function SuperAdminBranchesPage() {
  const [user, setUser] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const loadBranches = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/super-admin/branches').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (bRes.branches) setBranches(bRes.branches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const res = await fetch('/api/super-admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, address, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xatolik');

      alert(data.message);
      setIsModalOpen(false);
      setName('');
      setCode('');
      setAddress('');
      setPhone('');
      loadBranches();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Building2 className="text-emerald-600" />
              <span>Filiallar Boshqaruvi</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Spetsifikatsiya 3-bandi: Yangi filiallar erkin qo'shilishi mumkin bo'lgan tuzilma.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Yangi Filial Qo'shish</span>
          </button>
        </div>

        {/* Branches Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black font-mono">
                    Prefiks: {b.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                    Faol
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-lg mt-3">{b.name}</h3>

                <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>{b.address || 'Manzil kiritilmagan'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{b.phone || 'Telefon yo\'q'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <div className="font-extrabold text-slate-800">{b._count?.users || 0}</div>
                  <div className="text-[10px] text-slate-400">Xodim & Talaba</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <div className="font-extrabold text-slate-800">{b._count?.groups || 0}</div>
                  <div className="text-[10px] text-slate-400">Guruhlar</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <div className="font-extrabold text-slate-800">{b._count?.orders || 0}</div>
                  <div className="text-[10px] text-slate-400">Buyurtmalar</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Building2 className="text-emerald-600" size={20} />
                  <span>Yangi Filial Qo'shish</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateBranch} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Filial Nomi
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Samarqand filiali"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Filial Kodi / Prefiksi (3-4 harf)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Masalan: SAM, BUKH, NAV"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Bu prefiks o'quvchilar loginlarida ishlatiladi (masalan: SAM-0001)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Manzil
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ko'cha va mo'ljal..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Telefon Raqami
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 000 00 00"
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
                    {modalLoading ? 'Qo\'shilmoqda...' : 'Filialni Yaratish'}
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
