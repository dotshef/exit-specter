import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isWeekendKST } from '@/lib/date';
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

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const kindFilter = searchParams.get('kind');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const masterIdParam = searchParams.get('masterId');
  const organizationIdParam = searchParams.get('organizationId');
  const advertiserIdParam = searchParams.get('advertiserId');

  // Base where clause based on role
  let baseWhere: Record<string, unknown> = {};
  if (role === 'ADVERTISER') {
    // ADVERTISER는 자신의 광고만 볼 수 있음
    baseWhere = { advertiserId: session.id };
  } else if (role === 'AGENCY') {
    // AGENCY는 자기 조직의 모든 광고
    baseWhere = { organizationId: session.organizationId };
    // AGENCY는 advertiserId 필터만 추가 적용 가능
    if (advertiserIdParam) {
      baseWhere.advertiserId = parseInt(advertiserIdParam, 10);
    }
  } else if (role === 'MASTER') {
    // MASTER는 모든 필터 적용 가능
    if (advertiserIdParam) {
      baseWhere.advertiserId = parseInt(advertiserIdParam, 10);
    } else if (organizationIdParam) {
      baseWhere.organizationId = parseInt(organizationIdParam, 10);
    } else if (masterIdParam) {
      // masterId로 필터: 해당 총판이 관리하는 Organization들의 광고
      const orgIds = await prisma.organization.findMany({
        where: { masterId: parseInt(masterIdParam, 10) },
        select: { id: true },
      });
      baseWhere.organizationId = { in: orgIds.map((o) => o.id) };
    }
  }

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

  // 전체 개수 조회
  const totalCount = await prisma.ad.count({ where: filterWhere });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const ads = await prisma.ad.findMany({
    where: filterWhere,
    include: {
      advertiser: { select: { username: true } },
    },
    orderBy: { id: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
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
    productLink: ad.productLink,
    startDate: ad.startDate.toISOString().split('T')[0],
    endDate: ad.endDate.toISOString().split('T')[0],
    createdAt: ad.createdAt.toISOString(),
    updatedAt: ad.updatedAt.toISOString(),
  }));

  return NextResponse.json({ ads: formattedAds, stats, pagination: { page, totalPages, totalCount } });
}

interface AdInput {
  keyword?: string;
  productLink?: string;
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

  if (isWeekendKST()) {
    return NextResponse.json({ error: '주말(토요일, 일요일)에는 광고를 등록할 수 없습니다.' }, { status: 400 });
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
    if (ad.productLink && !/^https?:\/\/.+/.test(ad.productLink)) {
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
          productLink: ad.productLink || null,
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
      productLink: ad.productLink,
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

  // MASTER만 삭제 가능
  if (role !== 'MASTER') {
    return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
  }

  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: '삭제할 광고를 선택해주세요.' }, { status: 400 });
  }

  const where: Record<string, unknown> = { id: { in: ids } };

  const result = await prisma.ad.deleteMany({ where });

  return NextResponse.json({ deletedCount: result.count });
}
