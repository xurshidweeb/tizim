import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'BRANCH_HEAD')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const rules = await prisma.staffPenaltyBonusRule.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const logs = await prisma.staffPenaltyBonusLog.findMany({
      include: {
        user: { select: { fullName: true, login: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ rules, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Qoidani sozlash (Faollashtirish/Nofaol qilish va Summani o'zgartirish)
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'BRANCH_HEAD')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { ruleId, amountUzSum, threshold, isActive } = await request.json();

    const updated = await prisma.staffPenaltyBonusRule.update({
      where: { id: ruleId },
      data: {
        amountUzSum: Number(amountUzSum || 0),
        threshold: threshold !== undefined ? Number(threshold) : null,
        isActive: Boolean(isActive),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_RULE',
        entityName: 'STAFF_RULE',
        entityId: ruleId,
        details: `Jarima/Bonus qoidasi yangilandi: ${updated.title} (Summa: ${amountUzSum} so'm, Faol: ${isActive})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Qoida muvaffaqiyatli saqlandi',
      rule: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Yangi qoida yaratish (Default holda nofaol va 0 so'm!)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Faqat Super Admin uchun' }, { status: 403 });
  }

  try {
    const { title, targetRole, type, description } = await request.json();

    // Spetsifikatsiya 6-bandi: yangi qoida default holda nofaol va 0 so'm!
    const rule = await prisma.staffPenaltyBonusRule.create({
      data: {
        title,
        code: 'CUSTOM_' + Date.now(),
        targetRole: targetRole || 'TEACHER',
        type: type || 'PENALTY',
        amountUzSum: 0, // default 0
        isActive: false, // default nofaol!
        description,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Yangi qoida default holda 0 so\'m va nofaol holatda yaratildi',
      rule,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
