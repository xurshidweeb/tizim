import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { productId } = await request.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Mahsulot topilmadi' }, { status: 404 });
    }

    // Eski maqsadni yangilash yoki yangi maqsad yaratish
    await prisma.studentGoal.deleteMany({
      where: { studentId: user.id },
    });

    const goal = await prisma.studentGoal.create({
      data: {
        studentId: user.id,
        productId: product.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${product.name}" sizning asosiy maqsadingiz qilib belgilandi!`,
      goal,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
