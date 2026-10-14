import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat etilmagan' }, { status: 403 });
  }

  try {
    const whereClause = user.role === 'TEACHER' ? { teacherId: user.id } : {};

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        subject: true,
        branch: true,
        teacher: {
          select: { id: true, fullName: true, login: true },
        },
        students: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                login: true,
                phone: true,
                coinBalance: true,
                studentType: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ groups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
