import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateAttendanceBonus, evaluateMonthlyCycle } from '@/lib/coin-engine';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');

  if (!groupId) {
    return NextResponse.json({ error: 'groupId majburiy' }, { status: 400 });
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        subject: true,
        students: {
          where: { status: 'ACTIVE' },
          include: {
            student: true,
          },
        },
        lessons: {
          include: {
            attendances: true,
          },
        },
      },
    });

    if (!group) return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });

    // O'quvchilar bo'yicha oylik yig'indilarni hisoblash
    const results = group.students.map((sg) => {
      const student = sg.student;
      let regularScore = 0;
      let examScore = 0;
      let attendedCount = 0;

      group.lessons.forEach((l) => {
        const att = l.attendances.find((a) => a.studentId === student.id);
        if (att) {
          if (l.isExam) {
            examScore = att.examScore || 0;
          } else {
            regularScore += att.totalScore || 0;
            if (att.isPresent) attendedCount++;
          }
        }
      });

      const evaluation = evaluateMonthlyCycle(regularScore, examScore);
      const attBonus = calculateAttendanceBonus(attendedCount);

      return {
        studentId: student.id,
        login: student.login,
        fullName: student.fullName,
        currentWallet: student.coinBalance,
        attendedCount,
        regularScore,
        examScore,
        grandTotal: evaluation.grandTotal,
        passed110: evaluation.passed110,
        deficitFor110: evaluation.deficitFor110,
        coinsEarnedFromPoints: evaluation.coinsFromPoints,
        attendanceBonusCoins: attBonus,
        totalPossibleCoins: evaluation.coinsFromPoints + attBonus,
      };
    });

    return NextResponse.json({
      groupName: group.name,
      subjectName: group.subject.name,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Oylik yakuniy hisobni tasdiqlash va tangalarni o'quvchi balansiga o'tkazish
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { groupId } = await request.json();
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        subject: true,
        students: {
          where: { status: 'ACTIVE' },
          include: { student: true },
        },
        lessons: {
          include: { attendances: true },
        },
      },
    });

    if (!group) return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let totalAwarded = 0;

    for (const sg of group.students) {
      const student = sg.student;
      let regularScore = 0;
      let examScore = 0;
      let attendedCount = 0;

      group.lessons.forEach((l) => {
        const att = l.attendances.find((a) => a.studentId === student.id);
        if (att) {
          if (l.isExam) examScore = att.examScore || 0;
          else {
            regularScore += att.totalScore || 0;
            if (att.isPresent) attendedCount++;
          }
        }
      });

      const evaluation = evaluateMonthlyCycle(regularScore, examScore);
      const attBonus = calculateAttendanceBonus(attendedCount);
      const totalToAdd = evaluation.coinsFromPoints + attBonus;

      if (totalToAdd > 0) {
        // Balansni oshirish
        await prisma.user.update({
          where: { id: student.id },
          data: {
            coinBalance: { increment: totalToAdd },
          },
        });

        // 110 ball tranzaksiyasi
        if (evaluation.coinsFromPoints > 0) {
          await prisma.coinTransaction.create({
            data: {
              studentId: student.id,
              amount: evaluation.coinsFromPoints,
              type: 'MONTHLY_110_PASSED',
              description: `${group.subject.name} fanidan oylik 110 ball to'plandi (${evaluation.grandTotal} ball)`,
            },
          });
        }

        // Davomat bonusi tranzaksiyasi
        if (attBonus > 0) {
          await prisma.coinTransaction.create({
            data: {
              studentId: student.id,
              amount: attBonus,
              type: 'ATTENDANCE_BONUS',
              description: `12 ta darsdan ${attendedCount} tasiga kelganlik uchun davomat bonusi`,
            },
          });
        }

        totalAwarded += totalToAdd;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Oylik natijalar muvaffaqiyatli yakunlandi va jami ${totalAwarded} coin talabalar balansiga o'tkazildi!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
