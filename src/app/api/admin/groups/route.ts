import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const whereClause: any = {};
    if (user.role !== 'SUPER_ADMIN' && user.branchId) {
      whereClause.branchId = user.branchId;
    }

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        subject: true,
        branch: true,
        teacher: {
          select: { id: true, fullName: true, login: true, phone: true, avatarUrl: true },
        },
        students: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: { id: true, fullName: true, login: true, coinBalance: true, studentType: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subjects = await prisma.subject.findMany({ where: { isActive: true } });
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        status: 'ACTIVE',
        ...(user.role !== 'SUPER_ADMIN' && user.branchId ? { branchId: user.branchId } : {}),
      },
      select: { id: true, fullName: true, login: true, branchId: true },
    });

    return NextResponse.json({ groups, subjects, teachers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { name, subjectId, teacherId, scheduleType, lessonTime, room, branchId } = await request.json();

    const targetBranchId = user.branchId || branchId;
    if (!targetBranchId) {
      return NextResponse.json({ error: 'Filial tanlanishi shart' }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        branchId: targetBranchId,
        subjectId,
        teacherId,
        name,
        scheduleType: scheduleType || 'ODD',
        lessonTime: lessonTime || '14:00 - 16:00',
        room: room || 'Xona 1',
        status: 'ACTIVE',
      },
      include: { subject: true, teacher: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_GROUP',
        entityName: 'GROUP',
        entityId: group.id,
        details: `Yangi guruh ochildi: ${name} (${group.subject.name}), O'qituvchi: ${group.teacher.fullName}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${name}" guruhi muvaffaqiyatli yaratildi!`,
      group,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
