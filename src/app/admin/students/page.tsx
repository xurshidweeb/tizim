'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  GraduationCap, 
  UserPlus, 
  Search, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  UserCheck, 
  UserX,
  ShieldCheck,
  FileSpreadsheet,
  Phone,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function AdminStudentsPage() {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentType, setStudentType] = useState('PAID');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [createdStudentInfo, setCreatedStudentInfo] = useState<any>(null);

  const loadData = async () => {
    try {
      const [uRes, sRes, gRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/admin/students').then((r) => r.json()),
        fetch('/api/teacher/groups').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (sRes.students) setStudents(sRes.students);
      if (gRes.groups) {
        setGroups(gRes.groups);
        if (gRes.groups.length > 0) setSelectedGroupId(gRes.groups[0].id);
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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          studentType,
          groupId: selectedGroupId,
          branchId: user.branchId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Qo\'shishda xatolik');

      setCreatedStudentInfo(data.student);
      setFullName('');
      setPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (student: any) => {
    const isCurrentlyActive = student.status === 'ACTIVE';
    const nextStatus = isCurrentlyActive ? 'LEFT' : 'ACTIVE';

    if (
      isCurrentlyActive &&
      !confirm(
        `DIQQAT: Spetsifikatsiya 4.6-bandiga binoan, o'quvchi "Chiqib ketgan" deb belgilansa, uning barcha ${student.coinBalance} coin balansi darhol 0 ga tushadi! Tarixiy ma'lumotlar esa saqlanadi. Tasdiqlaysizmi?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.login.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <GraduationCap size={24} />
              </span>
              <span>O'quvchilar Ro'yxati & Boshqaruvi</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Filial prefiksi bilan avtomatik login, to'lov turi va Face ID ma'lumotlari boshqaruvi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/api/admin/export-logins"
              target="_blank"
              className="ios-press px-4 py-2.5 rounded-2xl liquid-glass border border-slate-300/80 hover:bg-white text-slate-700 font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Excel Eksport</span>
            </Link>
            <button
              onClick={() => {
                setCreatedStudentInfo(null);
                setIsModalOpen(true);
              }}
              className="ios-press px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
            >
              <UserPlus size={16} />
              <span>Yangi O'quvchi</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="liquid-glass-card p-3 sm:p-4 rounded-3xl flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ism, login (URG-...) yoki telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 ios-glass-input rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-bold text-slate-500">Holat:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 ios-glass-input rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Barchasi ({students.length})</option>
              <option value="ACTIVE">Faol o'quvchilar</option>
              <option value="LEFT">Chiqib ketganlar</option>
            </select>
          </div>
        </div>

        {/* 1. Mobile iOS Liquid Glass Cards List (Ekran < 768px uchun qulay kartalar) */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="liquid-glass-card p-8 rounded-3xl text-center text-slate-400 text-xs font-medium">
              O'quvchi topilmadi
            </div>
          ) : (
            filtered.map((s) => {
              const isActive = s.status === 'ACTIVE';
              return (
                <div
                  key={s.id}
                  className="liquid-glass-card p-4 rounded-3xl space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                        alt={s.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm shrink-0"
                      />
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{s.fullName}</span>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Face ID ✓
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span className="font-bold text-slate-600">ID: {s.login}</span>
                          {s.phone && (
                            <span className="flex items-center gap-0.5 text-slate-500">
                              • {s.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coin Badge */}
                    <div className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 font-black text-xs inline-flex items-center gap-1 shrink-0">
                      <Coins size={13} className="text-amber-600" />
                      <span>{s.coinBalance}</span>
                    </div>
                  </div>

                  {/* Group & Tuition Badges */}
                  <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate max-w-[200px]">
                      <BookOpen size={13} className="text-slate-400 shrink-0" />
                      {s.studentGroups?.length > 0 ? (
                        <span>{s.studentGroups[0].group.name}</span>
                      ) : (
                        <span className="text-slate-400">Guruhsiz</span>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.studentType === 'STATE_RESERVE'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {s.studentType === 'STATE_RESERVE' ? 'Davlat rezervi' : 'Pullik'}
                    </span>
                  </div>

                  {/* Action Pill */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isActive ? 'Faol o\'quvchi' : 'Chiqib ketgan'}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(s)}
                      className={`ios-press min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      <span>{isActive ? 'Chiqarish' : 'Faollashtirish'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop Full Liquid Glass Table (Katta ekranlar) */}
        <div className="hidden md:block liquid-glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">O'quvchi</th>
                  <th className="p-4">Guruh & Fan</th>
                  <th className="p-4 text-center">Ta'lim Turi</th>
                  <th className="p-4 text-center">Coin Balansi</th>
                  <th className="p-4 text-center">Holati</th>
                  <th className="p-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const isActive = s.status === 'ACTIVE';

                  return (
                    <tr key={s.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={s.fullName}
                            className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-sm shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{s.fullName}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Face ID ✓
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                              <span>ID: {s.login}</span>
                              <span>•</span>
                              <span>{s.phone || 'Tel: yo\'q'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {s.studentGroups?.length > 0 ? (
                          s.studentGroups.map((sg: any) => (
                            <div key={sg.id} className="text-xs font-bold text-slate-700">
                              {sg.group.name} <span className="text-slate-400 font-normal">({sg.group.subject.name})</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Guruh biriktirilmagan</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            s.studentType === 'STATE_RESERVE'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {s.studentType === 'STATE_RESERVE' ? 'Davlat rezervi (bepul)' : 'Pullik'}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-black text-amber-500 inline-flex items-center gap-1">
                          <Coins size={14} />
                          <span>{s.coinBalance} coin</span>
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isActive ? 'Faol' : 'Chiqib ketgan'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className={`ios-press px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                            isActive
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isActive ? 'Chiqib ketgan' : 'Qayta faollashtirish'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for adding student */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="liquid-glass-card rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-white/80 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <UserPlus className="text-emerald-600" size={20} />
                  <span>Yangi O'quvchi Qo'shish</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {createdStudentInfo ? (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-center">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                    <h4 className="font-black text-emerald-900 text-base">Muvaffaqiyatli Ro'yxatdan O'tkazildi!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      O'quvchi uchun avtomatik filial prefiksi asosida login va parol yaratildi.
                    </p>
                  </div>

                  <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">F.I.Sh:</span>
                      <span className="font-bold">{createdStudentInfo.fullName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400">Login:</span>
                      <span className="font-bold text-amber-400">{createdStudentInfo.login}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Parol:</span>
                      <span className="font-bold text-emerald-400">{createdStudentInfo.rawPassword}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="ios-press w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-lg"
                  >
                    Yopish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateStudent} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      F.I.Sh (Ism va Familiya)
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masalan: Sardor Boboyev"
                      className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
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
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Ta'lim Turi (To'lov)
                    </label>
                    <select
                      value={studentType}
                      onChange={(e) => setStudentType(e.target.value)}
                      className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="PAID">Pullik (Oylik to'lov qiladi)</option>
                      <option value="STATE_RESERVE">Davlat rezervi (Bepul o'qiydi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Guruhga Biriktirish
                    </label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.subject.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-slate-100/80 rounded-2xl text-[11px] text-slate-600">
                    ℹ️ <b>Eslatma:</b> Foydalanuvchi logini filial kodi asosida (masalan <span className="font-mono font-bold text-emerald-700">URG-0231</span>) avtomatik generatsiya qilinadi.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="ios-press px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                    >
                      {modalLoading ? 'Qo\'shilmoqda...' : 'Saqlash & Login Yaratish'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
