import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (session.role !== 'MASTER') {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  const organizations = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    organizations: organizations.map((org) => ({
      id: org.id,
      name: org.name,
      userCount: org._count.users,
    })),
  });
}
