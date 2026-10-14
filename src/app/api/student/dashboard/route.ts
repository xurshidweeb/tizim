import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { evaluateMonthlyCycle, calculateAttendanceBonus } from '@/lib/coin-engine';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    // O'quvchi biriktirilgan guruhlar va fanlar
    const studentGroups = await prisma.studentGroup.findMany({
      where: { studentId: user.id, status: 'ACTIVE' },
      include: {
        group: {
          include: {
            subject: true,
            teacher: { select: { fullName: true } },
            lessons: {
              include: {
                attendances: {
                  where: { studentId: user.id },
                },
              },
            },
          },
        },
      },
    });

    // Har bir fan bo'yicha joriy oylik progress (110 ball qoidasi)
    const subjectsProgress = studentGroups.map((sg) => {
      const g = sg.group;
      let regularScore = 0;
      let examScore = 0;
      let attendedLessons = 0;
      const totalLessons = 12;

      g.lessons.forEach((l) => {
        const att = l.attendances[0];
        if (att) {
          if (l.isExam) {
            examScore = att.examScore || 0;
          } else {
            regularScore += att.totalScore || 0;
            if (att.isPresent) attendedLessons++;
          }
        }
      });

      const evaluation = evaluateMonthlyCycle(regularScore, examScore);
      const attBonus = calculateAttendanceBonus(attendedLessons);

      return {
        groupId: g.id,
        groupName: g.name,
        subjectName: g.subject.name,
        teacherName: g.teacher.fullName,
        regularScore,
        examScore,
        grandTotal: evaluation.grandTotal,
        passed110: evaluation.passed110,
        deficitFor110: evaluation.deficitFor110,
        attendedLessons,
        totalLessons,
        attendanceBonusEarned: attBonus,
      };
    });

    // O'quvchi belgilagan maqsad (Goal)
    const goal = await prisma.studentGoal.findFirst({
      where: { studentId: user.id },
      include: { product: true },
    });

    // Oxirgi tranzaksiyalar
    const recentTransactions = await prisma.coinTransaction.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        login: user.login,
        fullName: user.fullName,
        coinBalance: user.coinBalance,
        branchName: user.branch?.name,
        studentType: user.studentType,
      },
      subjectsProgress,
      goal: goal
        ? {
            productName: goal.product.name,
            priceCoins: goal.product.priceCoins,
            imageUrl: goal.product.imageUrl,
            remainingCoins: Math.max(0, goal.product.priceCoins - user.coinBalance),
            progressPercent: Math.min(100, Math.round((user.coinBalance / goal.product.priceCoins) * 100)),
          }
        : null,
      recentTransactions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
