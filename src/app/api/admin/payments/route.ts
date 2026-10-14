import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const whereClause: any = {};
    if (user.role !== 'SUPER_ADMIN' && user.branchId) {
      whereClause.group = { branchId: user.branchId };
    }

    const studentGroups = await prisma.studentGroup.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, fullName: true, login: true, phone: true, studentType: true },
        },
        group: {
          include: { subject: true, branch: true },
        },
      },
      orderBy: { student: { fullName: 'asc' } },
    });

    return NextResponse.json({ studentGroups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// To'lov holatini belgilash (Qo'lda to'lov qayd etish)
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { studentGroupId, isPaid } = await request.json();

    const updated = await prisma.studentGroup.update({
      where: { id: studentGroupId },
      data: {
        monthlyTuitionPaid: Boolean(isPaid),
      },
      include: { student: true, group: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PAYMENT_UPDATE',
        entityName: 'STUDENT_GROUP',
        entityId: studentGroupId,
        details: `${updated.student.fullName} (${updated.group.name}) uchun to'lov holati "${isPaid ? 'To\'langan' : 'To\'lanmagan'}" deb belgilandi`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'To\'lov holati muvaffaqiyatli saqlandi',
      studentGroup: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
