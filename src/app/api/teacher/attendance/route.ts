import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateLessonScore, canTeacherEditAttendance } from '@/lib/coin-engine';
import { formatDailyParentMessage } from '@/lib/telegram-service';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');
  const dateStr = searchParams.get('date');

  if (!groupId || !dateStr) {
    return NextResponse.json({ error: 'groupId va date majburiy' }, { status: 400 });
  }

  try {
    const queryDate = new Date(dateStr);
    queryDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(queryDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Guruhni tekshirish
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        subject: true,
        students: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                login: true,
                coinBalance: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!group) return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });

    // Darsni topish yoki joriy sanadagi mavjud yozuvni olish
    const lesson = await prisma.lesson.findFirst({
      where: {
        groupId,
        date: {
          gte: queryDate,
          lt: nextDate,
        },
      },
      include: {
        attendances: true,
      },
    });

    return NextResponse.json({
      group,
      lesson,
      students: group.students.map((sg) => {
        const att = lesson?.attendances.find((a) => a.studentId === sg.studentId);
        return {
          studentId: sg.student.id,
          fullName: sg.student.fullName,
          login: sg.student.login,
          coinBalance: sg.student.coinBalance,
          avatarUrl: sg.student.avatarUrl,
          faceIdStatus: att?.isPresent ? '08:55 da kirdi (Face ID ✓)' : 'Face ID qayd etilmagan',
          isPresent: att ? att.isPresent : true,
          attendanceScore: att ? att.attendanceScore : 4,
          homeworkScore: att ? att.homeworkScore : 3,
          activityScore: att ? att.activityScore : 3,
          examScore: att ? att.examScore : 0,
          totalScore: att ? att.totalScore : 10,
        };
      }),
      canEdit: canTeacherEditAttendance(queryDate),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { groupId, dateStr, lessonNumber, isExam, attendances } = await request.json();

    const lessonDate = new Date(dateStr);
    lessonDate.setHours(12, 0, 0, 0);

    // O'qituvchi faqat joriy oy va o'tgan oyni o'zgartira oladi (2 oylik cheklov)
    if (user.role === 'TEACHER' && !canTeacherEditAttendance(lessonDate)) {
      return NextResponse.json(
        { error: 'Kechirasiz, 2 oydan eski davomatni faqat filial admini yoki Super-admin o\'zgartira oladi!' },
        { status: 403 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { subject: true },
    });
    if (!group) return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });

    // Lesson topish yoki yaratish
    let lesson = await prisma.lesson.findFirst({
      where: {
        groupId,
        lessonNumber: Number(lessonNumber || 1),
      },
    });

    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          groupId,
          lessonNumber: Number(lessonNumber || 1),
          isExam: Boolean(isExam),
          date: lessonDate,
          status: 'COMPLETED',
        },
      });
    } else {
      lesson = await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          date: lessonDate,
          isExam: Boolean(isExam),
          status: 'COMPLETED',
        },
      });
    }

    const parentDigestList: any[] = [];

    // Har bir o'quvchi uchun ballarni hisoblash va saqlash
    for (const att of attendances) {
      const calculated = calculateLessonScore({
        isPresent: att.isPresent,
        homeworkScore: Number(att.homeworkScore || 0),
        activityScore: Number(att.activityScore || 0),
        isExam: Boolean(isExam),
        examScore: Number(att.examScore || 0),
      });

      await prisma.attendanceRecord.upsert({
        where: {
          lessonId_studentId: {
            lessonId: lesson.id,
            studentId: att.studentId,
          },
        },
        update: {
          isPresent: att.isPresent,
          attendanceScore: calculated.attendanceScore,
          homeworkScore: calculated.homeworkScore,
          activityScore: calculated.activityScore,
          examScore: calculated.examScore,
          totalScore: calculated.totalScore,
          recordedByTeacherId: user.id,
          date: lessonDate,
        },
        create: {
          lessonId: lesson.id,
          studentId: att.studentId,
          isPresent: att.isPresent,
          attendanceScore: calculated.attendanceScore,
          homeworkScore: calculated.homeworkScore,
          activityScore: calculated.activityScore,
          examScore: calculated.examScore,
          totalScore: calculated.totalScore,
          recordedByTeacherId: user.id,
          date: lessonDate,
        },
      });

      // Telegram xabarnoma ma'lumoti
      parentDigestList.push({
        studentName: att.fullName || 'O\'quvchi',
        subjectName: group.subject.name,
        groupName: group.name,
        isPresent: att.isPresent,
        attendanceScore: calculated.attendanceScore,
        homeworkScore: calculated.homeworkScore,
        activityScore: calculated.activityScore,
        absentCountThisMonth: att.isPresent ? 0 : 1,
        atRiskBonusText: att.isPresent ? undefined : '12 darslik to\'liq davomat bonusi (+100 coin) xavf ostida!',
      });
    }

    // Ota-onalar xabari tayyorlanishi (Telegram log)
    const simulatedMessage = formatDailyParentMessage(parentDigestList);

    return NextResponse.json({
      success: true,
      message: 'Davomat va ballar muvaffaqiyatli saqlandi',
      telegramNotificationText: simulatedMessage,
    });
  } catch (err: any) {
    console.error('Save attendance error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
