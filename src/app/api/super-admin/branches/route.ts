import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Faqat Super Admin uchun' }, { status: 403 });
  }

  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: {
            users: true,
            groups: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ branches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Yangi filial qo'shish (Spetsifikatsiya 3-bandi: Yangi filiallar erkin qo'shilishi mumkin)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Faqat Super Admin uchun' }, { status: 403 });
  }

  try {
    const { name, code, address, phone } = await request.json();

    const cleanCode = code.toUpperCase().trim();

    const existing = await prisma.branch.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: 'Ushbu filial kodi allaqachon mavjud' }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        code: cleanCode,
        address,
        phone,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_BRANCH',
        entityName: 'BRANCH',
        entityId: branch.id,
        details: `Yangi filial qo'shildi: ${name} (${cleanCode})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Yangi "${name}" filiali muvaffaqiyatli qo'shildi!`,
      branch,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
