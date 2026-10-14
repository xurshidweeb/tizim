import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      login: user.login,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branch?.name,
      coinBalance: user.coinBalance,
      studentType: user.studentType,
    },
  });
}
