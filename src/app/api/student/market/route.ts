import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { priceCoins: 'asc' },
    });
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Mahsulot xarid qilish (Buyurtma berish)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Faqat o\'quvchilar xarid qila oladi' }, { status: 403 });
  }

  try {
    const { productId } = await request.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Mahsulot topilmadi yoki faol emas' }, { status: 404 });
    }

    if (product.stockQuantity <= 0) {
      return NextResponse.json({ error: 'Afsuski, ushbu mahsulot omborda qolmagan' }, { status: 400 });
    }

    if (user.coinBalance < product.priceCoins) {
      return NextResponse.json(
        {
          error: `Balansingizda yetarli coin yo'q. Mahsulot: ${product.priceCoins} coin, sizda: ${user.coinBalance} coin. Yana ${
            product.priceCoins - user.coinBalance
          } coin kerak.`,
        },
        { status: 400 }
      );
    }

    // Spetsifikatsiya 8-bandi: Coin buyurtma QILINGANDA kamayadi (berilganda emas).
    const [updatedUser, newOrder] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          coinBalance: { decrement: product.priceCoins },
        },
      }),
      prisma.order.create({
        data: {
          studentId: user.id,
          productId: product.id,
          branchId: user.branchId || 'default',
          coinsPaid: product.priceCoins,
          status: 'PENDING',
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: { decrement: 1 },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          studentId: user.id,
          amount: -product.priceCoins,
          type: 'SHOP_ORDER',
          description: `Do'kondan xarid: "${product.name}"`,
          referenceId: product.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Tabriklaymiz! "${product.name}" uchun buyurtma qabul qilindi. Filial admini tez orada mahsulotni topshiradi.`,
      newBalance: updatedUser.coinBalance,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
