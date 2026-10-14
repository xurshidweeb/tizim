import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateRandomPassword } from '@/lib/login-generator';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'BRANCH_HEAD')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const whereClause: any = { role: { not: 'STUDENT' } };
    if (user.role !== 'SUPER_ADMIN' && user.branchId) {
      whereClause.branchId = user.branchId;
    }

    const staff = await prisma.user.findMany({
      where: whereClause,
      include: {
        branch: true,
        taughtGroups: { include: { subject: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const branches = await prisma.branch.findMany({ where: { isActive: true } });

    return NextResponse.json({ staff, branches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'BRANCH_HEAD')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { fullName, login, phone, role, branchId } = await request.json();

    // Spetsifikatsiya 2-bandi: Filial boshlig'i faqat o'qituvchi qo'sha oladi; Super admin xohlagan rol
    if (user.role === 'BRANCH_HEAD' && role !== 'TEACHER') {
      return NextResponse.json({ error: 'Filial rahbari faqat o\'qituvchi qo\'sha oladi' }, { status: 403 });
    }

    const targetBranchId = user.branchId || branchId;
    const rawPassword = 'password123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const newStaff = await prisma.user.create({
      data: {
        fullName,
        login: login.trim(),
        phone,
        role: role || 'TEACHER',
        branchId: targetBranchId || null,
        passwordHash,
        status: 'ACTIVE',
      },
      include: { branch: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_STAFF',
        entityName: 'USER',
        entityId: newStaff.id,
        details: `Yangi xodim qo'shildi: ${fullName} (${role}, Login: ${login})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${fullName}" xodimi muvaffaqiyatli qo'shildi! Login: ${newStaff.login}, Parol: ${rawPassword}`,
      staff: newStaff,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
