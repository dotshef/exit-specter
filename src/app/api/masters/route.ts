import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // MASTER: 전체 총판 목록
  if (session.role === 'MASTER') {
    const masters = await prisma.user.findMany({
      where: { role: 'MASTER' },
      select: {
        id: true,
        username: true,
        nickname: true,
        createdAt: true,
        _count: {
          select: { managedOrganizations: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      masters: masters.map((m) => ({
        id: m.id,
        username: m.username,
        nickname: m.nickname,
        createdAt: m.createdAt.toISOString(),
        organizationCount: m._count.managedOrganizations,
      })),
    });
  }

  // AGENCY/ADVERTISER: 자기 org의 총판만 반환
  if (!session.organizationId) {
    return NextResponse.json({ masters: [] });
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    include: {
      master: {
        select: {
          id: true,
          username: true,
          nickname: true,
          createdAt: true,
          _count: {
            select: { managedOrganizations: true },
          },
        },
      },
    },
  });

  if (!org?.master) {
    return NextResponse.json({ masters: [] });
  }

  const m = org.master;
  return NextResponse.json({
    masters: [{
      id: m.id,
      username: m.username,
      nickname: m.nickname,
      createdAt: m.createdAt.toISOString(),
      organizationCount: m._count.managedOrganizations,
    }],
  });
}
