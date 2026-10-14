import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Login va parol kiritilishi shart' },
        { status: 400 }
      );
    }

    const cleanLogin = login.trim();

    const user = await prisma.user.findUnique({
      where: { login: cleanLogin },
      include: {
        branch: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Bunday login mavjud emas yoki noto\'g\'ri' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Ushbu foydalanuvchi tizimda faol emas' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Parol noto\'g\'ri' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      login: user.login,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
    });

    // Rolga qarab yo'naltirish manzili
    let redirectUrl = '/student';
    if (user.role === 'SUPER_ADMIN') redirectUrl = '/super-admin';
    else if (user.role === 'BRANCH_HEAD') redirectUrl = '/branch-head';
    else if (user.role === 'ADMIN') redirectUrl = '/admin';
    else if (user.role === 'TEACHER') redirectUrl = '/teacher';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        fullName: user.fullName,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch?.name,
        coinBalance: user.coinBalance,
      },
      redirectUrl,
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 kun
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi: ' + err.message },
      { status: 500 }
    );
  }
}
