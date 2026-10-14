'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CheckSquare, 
  Calendar, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Lock, 
  Award, 
  Sparkles,
  Info
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface StudentAttendanceRow {
  studentId: string;
  fullName: string;
  login: string;
  avatarUrl?: string;
  faceIdStatus?: string;
  isPresent: boolean;
  attendanceScore: number;
  homeworkScore: number;
  activityScore: number;
  examScore: number;
  totalScore: number;
}

function TeacherAttendanceContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [isExam, setIsExam] = useState<boolean>(false);
  
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [notificationModal, setNotificationModal] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 1. Foydalanuvchi va guruhlarni yuklash
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });

    fetch('/api/teacher/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.groups) {
          setGroups(data.groups);
          if (!selectedGroupId && data.groups.length > 0) {
            setSelectedGroupId(data.groups[0].id);
          }
        }
      });
  }, []);

  // 2. Tanlangan guruh va sana bo'yicha ma'lumotlarni yuklash
  const loadAttendance = async (groupId: string, date: string) => {
    if (!groupId) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/teacher/attendance?groupId=${groupId}&date=${date}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Yuklashda xatolik');

      setStudents(data.students || []);
      setCanEdit(data.canEdit ?? true);
      if (data.lesson) {
        setLessonNumber(data.lesson.lessonNumber);
        setIsExam(data.lesson.isExam);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      loadAttendance(selectedGroupId, dateStr);
    }
  }, [selectedGroupId, dateStr]);

  // Qoidalar bo'yicha ballni o'zgartirish
  const handleTogglePresent = (studentId: string) => {
    if (!canEdit) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          const nextPresent = !s.isPresent;
          // Qoida: Agar kelmasa, vazifa va aktivlik ham 0 bo'ladi!
          const attScore = nextPresent ? 4 : 0;
          const hw = nextPresent ? s.homeworkScore || 3 : 0;
          const act = nextPresent ? s.activityScore || 3 : 0;
          return {
            ...s,
            isPresent: nextPresent,
            attendanceScore: attScore,
            homeworkScore: hw,
            activityScore: act,
            totalScore: isExam ? s.examScore : attScore + hw + act,
          };
        }
        return s;
      })
    );
  };

  const handleScoreChange = (
    studentId: string,
    field: 'homeworkScore' | 'activityScore' | 'examScore',
    value: number
  ) => {
    if (!canEdit) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          if (!s.isPresent && !isExam) return s; // Kelmagan bo'lsa o'zgarmaydi

          const updated = { ...s, [field]: value };
          if (isExam) {
            updated.totalScore = updated.examScore;
          } else {
            updated.totalScore = updated.attendanceScore + updated.homeworkScore + updated.activityScore;
          }
          return updated;
        }
        return s;
      })
    );
  };

  // Davomatni saqlash
  const handleSave = async () => {
    if (!selectedGroupId) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          dateStr,
          lessonNumber,
          isExam,
          attendances: students,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Saqlashda xatolik');

      setNotificationModal(data.telegramNotificationText || 'Muvaffaqiyatli saqlandi');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      user={{
        fullName: user.fullName,
        login: user.login,
        role: user.role,
        branchName: user.branchName,
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CheckSquare className="text-emerald-600" />
              <span>Kunlik Davomat & Coin Ballar</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dars natijalarini kiriting. Har bir qatnashgan dars uchun 4 ball, vazifa (0-3) va dars aktivligi (0-3) beriladi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!canEdit && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
                <Lock size={14} />
                <span>Eski dars (faqat ko'rish)</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !canEdit || students.length === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              {saving ? 'Saqlanmoqda...' : 'Davomatni Saqlash'}
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Guruhni tanlang</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.subject.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dars sanasi</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dars tartibi</label>
            <select
              value={lessonNumber}
              onChange={(e) => {
                const num = Number(e.target.value);
                setLessonNumber(num);
                if (num === 13) setIsExam(true);
                else setIsExam(false);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}-dars (Oddiy dars)
                </option>
              ))}
              <option value={13}>13-dars (Imtihon kuni - 40 ball)</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl w-full cursor-pointer">
              <input
                type="checkbox"
                checked={isExam}
                onChange={(e) => setIsExam(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-700">Imtihon kuni (0-40 ball)</span>
            </label>
          </div>
        </div>

        {/* Info Notification Alert */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
          <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Qat'iy qoida:</span> Darsga kelmagan o'quvchi uchun vazifa va faollik ballari hisoblanmaydi (0 bo'ladi).
            O'qituvchi faqat joriy oy va o'tgan oy (jami 2 oy) davomatini o'zgartira oladi.
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Students List: Mobile Touch Cards + Desktop Glass Table */}
        {loading ? (
          <div className="liquid-glass-card rounded-3xl p-12 text-center text-slate-500 text-sm">
            Yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="liquid-glass-card rounded-3xl p-12 text-center text-slate-500 text-sm">
            Ushbu guruhda o'quvchilar yo'q
          </div>
        ) : (
          <>
            {/* 1. Mobile iOS Touch Cards (Kichik ekranlarda juda qulay) */}
            <div className="md:hidden space-y-3.5">
              {students.map((s) => (
                <div
                  key={s.studentId}
                  className={`liquid-glass-card rounded-3xl p-4 transition-all ${
                    !s.isPresent && !isExam
                      ? 'border-red-300/60 bg-red-50/40'
                      : 'border-white/80 bg-white/85'
                  }`}
                >
                  {/* Student Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                        alt={s.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-sm shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{s.fullName}</h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {s.login}</div>
                        {s.faceIdStatus && (
                          <div className="mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded-md inline-block border border-emerald-200/80">
                            {s.faceIdStatus}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Kunlik jami</div>
                      <div className="text-xl font-black text-emerald-600">{s.totalScore} <span className="text-xs font-bold">ball</span></div>
                    </div>
                  </div>

                  {/* Attendance Toggle (44px+ touch target) */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePresent(s.studentId)}
                      disabled={!canEdit}
                      className={`ios-press w-full py-2.5 px-4 rounded-2xl font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                        s.isPresent
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25'
                      }`}
                    >
                      {s.isPresent ? '✅ Darsda qatnashdi (+4 ball)' : '❌ Darsga kelmadi (0 ball)'}
                    </button>
                  </div>

                  {/* Homework & Activity Scoring (Only if present) */}
                  {!isExam ? (
                    s.isPresent ? (
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                        {/* Homework score buttons */}
                        <div className="bg-slate-50/80 p-2 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-extrabold uppercase text-slate-500 text-center mb-1.5">
                            Vazifa ({s.homeworkScore}/3)
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[0, 1, 2, 3].map((val) => (
                              <button
                                key={val}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => handleScoreChange(s.studentId, 'homeworkScore', val)}
                                className={`h-8 rounded-xl font-extrabold text-xs transition-all ${
                                  s.homeworkScore === val
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Activity score buttons */}
                        <div className="bg-slate-50/80 p-2 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-extrabold uppercase text-slate-500 text-center mb-1.5">
                            Faollik ({s.activityScore}/3)
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[0, 1, 2, 3].map((val) => (
                              <button
                                key={val}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => handleScoreChange(s.studentId, 'activityScore', val)}
                                className={`h-8 rounded-xl font-extrabold text-xs transition-all ${
                                  s.activityScore === val
                                    ? 'bg-teal-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-center text-[11px] text-red-500 font-semibold italic">
                        Kelmadi deb belgilangani uchun barcha ballar 0 ga tenglandi
                      </div>
                    )
                  ) : (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Imtihon bali (0-40):</span>
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={s.examScore}
                        disabled={!canEdit}
                        onChange={(e) =>
                          handleScoreChange(s.studentId, 'examScore', Number(e.target.value))
                        }
                        className="w-24 px-3 py-1.5 text-center font-black bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Desktop Full Table (Katta ekranlar uchun) */}
            <div className="hidden md:block liquid-glass-card rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <th className="p-4">O'quvchi</th>
                      <th className="p-4 text-center">Davomat (4 ball)</th>
                      {!isExam ? (
                        <>
                          <th className="p-4 text-center">Vazifa (0-3 ball)</th>
                          <th className="p-4 text-center">Darsda faolligi (0-3 ball)</th>
                        </>
                      ) : (
                        <th className="p-4 text-center">Imtihon natijasi (0-40 ball)</th>
                      )}
                      <th className="p-4 text-right">Kunlik Jami</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr
                        key={s.studentId}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !s.isPresent && !isExam ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={s.fullName}
                              className="w-10 h-10 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-sm shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{s.fullName}</div>
                              <div className="text-xs text-slate-400 font-mono">ID: {s.login}</div>
                              {s.faceIdStatus && (
                                <div className="mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block border border-emerald-200">
                                  {s.faceIdStatus}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePresent(s.studentId)}
                            disabled={!canEdit}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              s.isPresent
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {s.isPresent ? '✅ Keldi (+4)' : '❌ Kelmadi (0)'}
                          </button>
                        </td>

                        {!isExam ? (
                          <>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                {[0, 1, 2, 3].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    disabled={!canEdit || !s.isPresent}
                                    onClick={() => handleScoreChange(s.studentId, 'homeworkScore', val)}
                                    className={`h-7 w-7 rounded font-bold text-xs transition-colors ${
                                      s.homeworkScore === val && s.isPresent
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-200 disabled:opacity-30'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                {[0, 1, 2, 3].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    disabled={!canEdit || !s.isPresent}
                                    onClick={() => handleScoreChange(s.studentId, 'activityScore', val)}
                                    className={`h-7 w-7 rounded font-bold text-xs transition-colors ${
                                      s.activityScore === val && s.isPresent
                                        ? 'bg-teal-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-200 disabled:opacity-30'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </>
                        ) : (
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={s.examScore}
                              disabled={!canEdit}
                              onChange={(e) =>
                                handleScoreChange(s.studentId, 'examScore', Number(e.target.value))
                              }
                              className="w-24 px-3 py-1.5 text-center font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                        )}

                        <td className="p-4 text-right font-black text-base text-slate-800">
                          {s.totalScore} ball
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Telegram Notification Modal Simulation */}
        {notificationModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <CheckCircle2 size={24} />
                <h3 className="font-extrabold text-lg text-slate-900">
                  Davomat Saqlandi va Ota-onalarga Yuborildi!
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Ota-onalar Telegram botiga quyidagi formatda xushmuomala, baholovchi yomon so'zlarsiz xabarnoma yo'llandi:
              </p>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-60 border border-slate-800">
                {notificationModal}
              </pre>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setNotificationModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Tushundim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function TeacherAttendancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>}>
      <TeacherAttendanceContent />
    </Suspense>
  );
}
