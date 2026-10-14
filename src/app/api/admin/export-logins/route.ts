import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'BRANCH_HEAD' && user.role !== 'SUPER_ADMIN' && user.role !== 'TEACHER')) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  try {
    const whereClause: any = { role: 'STUDENT', status: 'ACTIVE' };
    if (user.role !== 'SUPER_ADMIN' && user.branchId) {
      whereClause.branchId = user.branchId;
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        branch: true,
        studentGroups: {
          include: {
            group: { include: { subject: true } },
          },
        },
      },
      orderBy: { login: 'asc' },
    });

    const rows = students.map((s) => ({
      'Login / ID': s.login,
      'F.I.Sh': s.fullName,
      'Telefon': s.phone || '-',
      'Filial': s.branch?.name || '-',
      'To\'lov turi': s.studentType === 'STATE_RESERVE' ? 'Davlat rezervi (bepul)' : 'Pullik',
      'Mavjud Coin Balansi': s.coinBalance,
      'Guruhlari': s.studentGroups.map((g) => `${g.group.name} (${g.group.subject.name})`).join(', ') || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Oquvchilar_Loginlari');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buf, {
      headers: {
        'Content-Disposition': 'attachment; filename="IT_Time_Oquvchilar_Loginlari.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
