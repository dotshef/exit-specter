import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const masterId = searchParams.get('masterId');

  let where: Record<string, unknown> = { role: 'ADVERTISER' };

  if (session.role === 'MASTER') {
    if (organizationId) {
      where.organizationId = parseInt(organizationId, 10);
    } else if (masterId) {
      // masterId로 필터: 해당 총판이 관리하는 조직들의 광고주
      const orgIds = await prisma.organization.findMany({
        where: { masterId: parseInt(masterId, 10) },
        select: { id: true },
      });
      where.organizationId = { in: orgIds.map((o) => o.id) };
    }
  } else if (session.role === 'AGENCY') {
    // AGENCY: 자기 org 광고주만
    where.organizationId = session.organizationId;
  } else {
    // ADVERTISER: 자기 자신만
    where.id = session.id;
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      organization: true,
      _count: { select: { ads: true } },
    },
    orderBy: { id: 'desc' },
  });

  return NextResponse.json({
    advertisers: users.map((u) => ({
      id: u.id,
      username: u.username,
      nickname: u.nickname,
      organizationId: u.organizationId,
      organizationName: u.organization?.name || null,
      adCount: u._count.ads,
    })),
  });
}
