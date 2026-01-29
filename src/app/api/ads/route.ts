import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';

function computeStats(ads: { kind: string; status: string }[]) {
  function countByStatus(list: { status: string }[]) {
    return {
      total: list.length,
      active: list.filter((a) => a.status === 'ACTIVE').length,
      error: list.filter((a) => a.status === 'ERROR').length,
      waiting: list.filter((a) => a.status === 'WAITING').length,
      endingSoon: list.filter((a) => a.status === 'ENDING_SOON').length,
      ended: list.filter((a) => a.status === 'ENDED').length,
    };
  }

  return {
    all: countByStatus(ads),
    paid: countByStatus(ads.filter((a) => a.kind === 'PAID')),
    test: countByStatus(ads.filter((a) => a.kind === 'TEST')),
  };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const kindFilter = searchParams.get('kind');

  // Base where clause based on role
  let baseWhere: Record<string, unknown> = {};
  if (role === 'ADVERTISER') {
    // ADVERTISER는 자신의 광고만 볼 수 있음
    baseWhere = { advertiserId: session.id };
  } else if (role === 'AGENCY') {
    // AGENCY는 자기 조직의 모든 광고
    baseWhere = { organizationId: session.organizationId };
  }
  // MASTER는 모든 광고

  // Fetch all ads for stats (unfiltered by status/kind)
  const allAds = await prisma.ad.findMany({
    where: baseWhere,
    select: { kind: true, status: true },
  });

  const stats = computeStats(allAds);

  // Build filter where clause
  const filterWhere: Record<string, unknown> = { ...baseWhere };
  if (statusFilter) {
    filterWhere.status = statusFilter;
  }
  if (kindFilter) {
    filterWhere.kind = kindFilter;
  }

  const ads = await prisma.ad.findMany({
    where: filterWhere,
    include: {
      advertiser: { select: { username: true } },
    },
    orderBy: { id: 'desc' },
  });

  const formattedAds = ads.map((ad) => ({
    id: ad.id,
    organizationId: ad.organizationId,
    advertiserId: ad.advertiserId,
    advertiserUsername: ad.advertiser.username,
    kind: ad.kind,
    status: ad.status,
    keyword: ad.keyword,
    rank: ad.rank,
    productName: ad.productName,
    productId: ad.productId,
    startDate: ad.startDate.toISOString().split('T')[0],
    endDate: ad.endDate.toISOString().split('T')[0],
    createdAt: ad.createdAt.toISOString(),
    updatedAt: ad.updatedAt.toISOString(),
  }));

  return NextResponse.json({ ads: formattedAds, stats });
}

interface AdInput {
  keyword?: string;
  productName?: string;
  startDate: string;
  endDate: string;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (role === 'ADVERTISER') {
    return NextResponse.json({ error: '광고 등록 권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { advertiserId, kind, ads } = body as {
    advertiserId: number;
    kind: string;
    ads: AdInput[];
  };

  if (!advertiserId || !kind || !ads || ads.length === 0) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  // Verify advertiser exists and get their orgId
  const advertiser = await prisma.user.findUnique({
    where: { id: advertiserId },
  });

  if (!advertiser) {
    return NextResponse.json({ error: '광고주를 찾을 수 없습니다.' }, { status: 400 });
  }

  // AGENCY can only create ads for advertisers in their org
  if (role === 'AGENCY' && advertiser.organizationId !== session.organizationId) {
    return NextResponse.json({ error: '광고 등록 권한이 없습니다.' }, { status: 403 });
  }

  // Validation
  for (const ad of ads) {
    if (!ad.startDate || !ad.endDate) {
      return NextResponse.json({ error: '시작일과 종료일은 필수입니다.' }, { status: 400 });
    }
    if (ad.keyword && ad.keyword.length > 10) {
      return NextResponse.json({ error: '키워드는 10자 이내로 입력해주세요.' }, { status: 400 });
    }
    if (ad.productName && !/^https?:\/\/.+/.test(ad.productName)) {
      return NextResponse.json({ error: '상품 링크는 http:// 또는 https://로 시작해야 합니다.' }, { status: 400 });
    }
  }

  // Create multiple ads
  const createdAds = await prisma.$transaction(
    ads.map((ad) =>
      prisma.ad.create({
        data: {
          organizationId: advertiser.organizationId!,
          advertiserId,
          kind,
          status: 'WAITING',
          keyword: ad.keyword || null,
          productName: ad.productName || null,
          startDate: new Date(ad.startDate),
          endDate: new Date(ad.endDate),
        },
        include: { advertiser: { select: { username: true } } },
      })
    )
  );

  return NextResponse.json({
    ads: createdAds.map((ad) => ({
      id: ad.id,
      organizationId: ad.organizationId,
      advertiserId: ad.advertiserId,
      advertiserUsername: ad.advertiser.username,
      kind: ad.kind,
      status: ad.status,
      keyword: ad.keyword,
      rank: ad.rank,
      productName: ad.productName,
      productId: ad.productId,
      startDate: ad.startDate.toISOString().split('T')[0],
      endDate: ad.endDate.toISOString().split('T')[0],
      createdAt: ad.createdAt.toISOString(),
      updatedAt: ad.updatedAt.toISOString(),
    })),
    count: createdAds.length,
  }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (role === 'ADVERTISER') {
    return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
  }

  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: '삭제할 광고를 선택해주세요.' }, { status: 400 });
  }

  let where: Record<string, unknown> = { id: { in: ids } };

  if (role === 'AGENCY') {
    where = { ...where, organizationId: session.organizationId };
  }

  const result = await prisma.ad.deleteMany({ where });

  return NextResponse.json({ deletedCount: result.count });
}
