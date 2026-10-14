import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateNextLogin, generateRandomPassword } from '@/lib/login-generator';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const whereClause: any = { role: 'STUDENT' };
    if (user.role !== 'SUPER_ADMIN' && user.branchId) {
      whereClause.branchId = user.branchId;
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        branch: true,
        studentGroups: {
          include: {
            group: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ students });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Yangi o'quvchi qo'shish (Avtomatik login generatsiya bilan)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { fullName, phone, studentType, groupId, branchId } = await request.json();

    const targetBranchId = user.branchId || branchId;
    if (!targetBranchId) {
      return NextResponse.json({ error: 'Filial tanlanishi shart' }, { status: 400 });
    }

    const branch = await prisma.branch.findUnique({ where: { id: targetBranchId } });
    if (!branch) return NextResponse.json({ error: 'Filial topilmadi' }, { status: 404 });

    // Spetsifikatsiya 10-bandi: Avtomatik filial-prefiks + tartib raqamga asoslangan unique login
    const autoLogin = await generateNextLogin(branch.code);
    const rawPassword = generateRandomPassword(6);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const student = await prisma.user.create({
      data: {
        branchId: branch.id,
        login: autoLogin,
        passwordHash,
        fullName,
        phone,
        role: 'STUDENT',
        status: 'ACTIVE',
        studentType: studentType || 'PAID',
        coinBalance: 0,
      },
    });

    if (groupId) {
      await prisma.studentGroup.create({
        data: {
          studentId: student.id,
          groupId,
          status: 'ACTIVE',
          monthlyTuitionPaid: studentType === 'STATE_RESERVE',
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entityName: 'USER',
        entityId: student.id,
        details: `Yangi o'quvchi qo'shildi: ${fullName} (Login: ${autoLogin}, Parol: ${rawPassword})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `O'quvchi muvaffaqiyatli qo'shildi! Login: ${autoLogin}, Parol: ${rawPassword}`,
      student: {
        id: student.id,
        fullName: student.fullName,
        login: autoLogin,
        rawPassword,
        phone: student.phone,
        studentType: student.studentType,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// O'quvchi statusini o'zgartirish (Chiqib ketsa: coin darhol 0 ga tushadi!)
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { studentId, status } = await request.json();

    const targetStudent = await prisma.user.findUnique({ where: { id: studentId } });
    if (!targetStudent) return NextResponse.json({ error: 'O\'quvchi topilmadi' }, { status: 404 });

    // Spetsifikatsiya 4.6-bandi: O'quvchi chiqib ketsa, coin balansi darhol 0 ga tushadi. Tarix saqlanadi.
    const updateData: any = { status };
    if (status === 'LEFT' && targetStudent.coinBalance > 0) {
      updateData.coinBalance = 0;

      await prisma.coinTransaction.create({
        data: {
          studentId: targetStudent.id,
          amount: -targetStudent.coinBalance,
          type: 'BALANCE_RESET_ON_LEAVE',
          description: 'O\'quvchi markazdan chiqib ketganligi sababli barcha coin balansi bekor qilindi',
        },
      });
    }

    const updated = await prisma.user.update({
      where: { id: studentId },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_STATUS',
        entityName: 'USER',
        entityId: targetStudent.id,
        details: `O'quvchi holati "${status}" ga o'zgartirildi. (Avvalgi balans: ${targetStudent.coinBalance}, yangi balans: ${updated.coinBalance})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `O'quvchi holati "${status}" ga o'zgartirildi`,
      updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
