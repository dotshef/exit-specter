import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const masterId = searchParams.get('masterId');

  let where: Record<string, unknown> = {};

  if (session.role === 'MASTER') {
    if (masterId) {
      where = { masterId: parseInt(masterId, 10) };
    }
  } else {
    // AGENCY/ADVERTISER: 자기 org만
    where = { id: session.organizationId };
  }

  const orgs = await prisma.organization.findMany({
    where,
    include: {
      master: { select: { id: true, username: true, nickname: true } },
      users: {
        select: { id: true, username: true, nickname: true, memo: true, role: true },
        orderBy: { id: 'asc' },
      },
      _count: { select: { users: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    agencies: orgs.map((org) => ({
      id: org.id,
      name: org.name,
      masterId: org.masterId,
      masterNickname: org.master?.nickname || org.master?.username || null,
      userCount: org._count.users,
      agencyUsers: org.users
        .filter((u) => u.role === 'AGENCY')
        .map((u) => ({ id: u.id, username: u.username, nickname: u.nickname, memo: u.memo, role: u.role })),
      advertisers: org.users
        .filter((u) => u.role === 'ADVERTISER' && (session.role !== 'ADVERTISER' || u.id === session.id))
        .map((u) => ({ id: u.id, username: u.username, nickname: u.nickname, memo: u.memo, role: u.role })),
    })),
  });
}
