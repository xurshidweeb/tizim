import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });

  try {
    // 1. O'quvchi guruhlarini topish
    const userGroups = await prisma.studentGroup.findMany({
      where: { studentId: user.id, status: 'ACTIVE' },
      include: {
        group: {
          include: {
            subject: true,
            students: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  select: { id: true, fullName: true, login: true },
                },
              },
            },
            lessons: {
              include: { attendances: true },
            },
          },
        },
      },
    });

    const groupRankings = userGroups.map((ug) => {
      const g = ug.group;

      // Guruh ichidagi har bir o'quvchining jami faollik ballarini hisoblash
      const memberScores = g.students.map((st) => {
        let totalActivityScore = 0;
        g.lessons.forEach((l) => {
          const att = l.attendances.find((a) => a.studentId === st.student.id);
          if (att) {
            totalActivityScore += att.totalScore || 0;
          }
        });

        return {
          studentId: st.student.id,
          fullName: st.student.fullName,
          login: st.student.login,
          activityScore: totalActivityScore,
          isCurrentUser: st.student.id === user.id,
        };
      });

      // Kamayish tartibida saralash
      memberScores.sort((a, b) => b.activityScore - a.activityScore);

      const currentUserRank = memberScores.findIndex((m) => m.studentId === user.id) + 1;
      const currentScore = memberScores.find((m) => m.studentId === user.id)?.activityScore || 0;

      // Agar TOP-3 da bo'lmasa, yuqoridagi o'quvchiga yetish uchun qancha kerakligini hisoblash
      let recommendation = 'Siz ajoyib natija ko\'rsatmoqdasiz!';
      if (currentUserRank > 1 && memberScores[currentUserRank - 2]) {
        const diff = memberScores[currentUserRank - 2].activityScore - currentScore;
        recommendation = `Keyingi o'ringa ko'tarilish uchun yana ${diff + 1} ball to'plashingiz kerak!`;
      }

      return {
        groupId: g.id,
        groupName: g.name,
        subjectName: g.subject.name,
        totalMembers: memberScores.length,
        currentUserRank,
        currentScore,
        recommendation,
        members: memberScores,
      };
    });

    // 2. Butun markaz miqyosida TOP-7 (har bir fan bo'yicha)
    const subjects = await prisma.subject.findMany({
      include: {
        groups: {
          include: {
            students: {
              where: { status: 'ACTIVE' },
              include: {
                student: { select: { id: true, fullName: true, login: true } },
              },
            },
            lessons: {
              include: { attendances: true },
            },
          },
        },
      },
    });

    const centerTop7BySubject = subjects.map((sub) => {
      const studentScoreMap = new Map<string, { fullName: string; login: string; score: number; isCurrentUser: boolean }>();

      sub.groups.forEach((g) => {
        g.students.forEach((st) => {
          let score = 0;
          g.lessons.forEach((l) => {
            const att = l.attendances.find((a) => a.studentId === st.student.id);
            if (att) score += att.totalScore || 0;
          });

          const prev = studentScoreMap.get(st.student.id);
          const currentTotal = (prev?.score || 0) + score;

          studentScoreMap.set(st.student.id, {
            fullName: st.student.fullName,
            login: st.student.login,
            score: currentTotal,
            isCurrentUser: st.student.id === user.id,
          });
        });
      });

      const allSorted = Array.from(studentScoreMap.values()).sort((a, b) => b.score - a.score);
      const top7 = allSorted.slice(0, 7);

      const userCenterRank = allSorted.findIndex((s) => s.isCurrentUser) + 1;
      let advice = '';
      if (userCenterRank > 7 && top7[6]) {
        const needed = top7[6].score - (allSorted[userCenterRank - 1]?.score || 0) + 1;
        advice = `Yana ${needed} ball to'plasangiz — butun markaz TOP-7 ro'yxatiga kirasiz!`;
      } else if (userCenterRank > 0 && userCenterRank <= 7) {
        advice = 'Tabriklaymiz! Siz butun markaz bo\'yicha TOP-7 talabalar safidasiz! Oy oxirida sizga maxsus sertifikat beriladi.';
      }

      return {
        subjectName: sub.name,
        top7,
        userRank: userCenterRank > 0 ? userCenterRank : null,
        advice,
      };
    });

    return NextResponse.json({
      groupRankings,
      centerTop7BySubject,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
