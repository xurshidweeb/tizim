'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Layers, Plus, Calendar, Clock, MapPin, Users, X, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminGroupsPage() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [scheduleType, setScheduleType] = useState('ODD');
  const [lessonTime, setLessonTime] = useState('14:00 - 16:00');
  const [room, setRoom] = useState('Xona 3');
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = async () => {
    try {
      const [uRes, gRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/admin/groups').then((r) => r.json()),
      ]);

      if (uRes.user) setUser(uRes.user);
      if (gRes.groups) setGroups(gRes.groups);
      if (gRes.subjects) {
        setSubjects(gRes.subjects);
        if (gRes.subjects.length > 0) setSubjectId(gRes.subjects[0].id);
      }
      if (gRes.teachers) {
        setTeachers(gRes.teachers);
        if (gRes.teachers.length > 0) setTeacherId(gRes.teachers[0].id);
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

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subjectId,
          teacherId,
          scheduleType,
          lessonTime,
          room,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Guruh ochishda xatolik');

      alert(data.message);
      setIsModalOpen(false);
      setName('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading || !user) return null;

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.subject.name.toLowerCase().includes(search.toLowerCase()) ||
      g.teacher.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Layers size={24} />
              </span>
              <span>Guruhlar va Dars Jadvallari</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Barcha o'quv kurslari, guruhlar, dars vaqtlari va tayinlangan o'qituvchilar nazorati.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="ios-press px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Yangi Guruh Ochish</span>
          </button>
        </div>

        {/* Search */}
        <div className="liquid-glass-card p-3 sm:p-4 rounded-3xl flex items-center">
          <Search size={18} className="text-slate-400 mr-2.5" />
          <input
            type="text"
            placeholder="Guruh nomi, fan yoki o'qituvchi bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="liquid-glass-card rounded-[28px] p-6 flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-800 text-xs font-black">
                    {g.subject.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    Faol
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-xl mt-3.5 tracking-tight group-hover:text-emerald-600 transition-colors">
                  {g.name}
                </h3>

                <div className="space-y-2 mt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400 shrink-0" />
                    <span>O'qituvchi: <b className="text-slate-900">{g.teacher.fullName}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>
                      {g.scheduleType === 'ODD'
                        ? 'Toq kunlar (Dush-Chor-Jum)'
                        : g.scheduleType === 'EVEN'
                        ? 'Juft kunlar (Sesh-Pay-Shan)'
                        : 'Har kuni'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span>Vaqt: <b>{g.lessonTime}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>Xona: <b>{g.room || 'Xona 1'}</b></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">O'quvchilar:</span>{' '}
                  <b className="text-slate-900 font-extrabold">{g.students?.length || 0} nafar</b>
                </div>

                <Link
                  href={`/teacher/attendance?groupId=${g.id}`}
                  className="ios-press px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Davomat</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="liquid-glass-card rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-white/80 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Layers className="text-emerald-600" size={20} />
                  <span>Yangi Guruh Ochish</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Guruh Nomi</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: FN-102 yoki IELTS-301"
                    className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Fan / Yo'nalish</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Biriktirilgan O'qituvchi</label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.login})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Dars Kunlari</label>
                    <select
                      value={scheduleType}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="ODD">Toq kunlar</option>
                      <option value="EVEN">Juft kunlar</option>
                      <option value="EVERYDAY">Har kuni</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Xona</label>
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="Xona 3"
                      className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Dars Vaqti</label>
                  <input
                    type="text"
                    value={lessonTime}
                    onChange={(e) => setLessonTime(e.target.value)}
                    placeholder="Masalan: 14:00 - 16:00"
                    className="w-full px-3.5 py-2.5 ios-glass-input rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none"
                  />
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
                    {modalLoading ? 'Ochilmoqda...' : 'Guruhni Yaratish'}
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
