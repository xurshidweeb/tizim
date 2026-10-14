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
      whereClause.branchId = user.branchId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        product: true,
        student: {
          select: { id: true, fullName: true, login: true, phone: true, coinBalance: true },
        },
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const { orderId, newStatus, cancelReason } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true, student: true },
    });

    if (!order) return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });

    // Spetsifikatsiya 8-bandi: Bekor qilindi (bekor bo'lsa, coin qaytariladi)
    if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelReason: cancelReason || 'Admin tomonidan bekor qilindi',
            handledByUserId: user.id,
          },
        }),
        // Coinni qaytarish
        prisma.user.update({
          where: { id: order.studentId },
          data: {
            coinBalance: { increment: order.coinsPaid },
          },
        }),
        // Ombordagi sonini qaytarish
        prisma.product.update({
          where: { id: order.productId },
          data: {
            stockQuantity: { increment: 1 },
          },
        }),
        // Tranzaksiya jurnali
        prisma.coinTransaction.create({
          data: {
            studentId: order.studentId,
            amount: order.coinsPaid,
            type: 'SHOP_REFUND',
            description: `Bekor qilingan buyurtma uchun coin qaytarildi: "${order.product.name}"`,
            referenceId: order.id,
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'CANCEL_ORDER',
            entityName: 'ORDER',
            entityId: order.id,
            details: `Buyurtma bekor qilindi va talabaga ${order.coinsPaid} coin qaytarildi. Sabab: ${cancelReason}`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Buyurtma bekor qilindi va ${order.coinsPaid} coin o'quvchiga qaytarildi!`,
      });
    }

    // Holatni yangilash (APPROVED yoki DELIVERED)
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        handledByUserId: user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_ORDER_STATUS',
        entityName: 'ORDER',
        entityId: order.id,
        details: `Buyurtma holati "${newStatus}" ga o'zgartirildi`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Buyurtma holati "${newStatus}" ga o'zgartirildi`,
      order: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
