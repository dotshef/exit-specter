import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  const { id } = await params;
  const targetId = parseInt(id, 10);

  const ad = await prisma.ad.findUnique({ where: { id: targetId } });

  if (!ad) {
    return NextResponse.json({ error: '광고를 찾을 수 없습니다.' }, { status: 404 });
  }

  // 권한 체크: AGENCY는 자기 조직만, ADVERTISER는 자기 광고만
  if (role === 'AGENCY' && ad.organizationId !== session.organizationId) {
    return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
  }
  if (role === 'ADVERTISER' && ad.advertiserId !== session.id) {
    return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { status, keyword, rank, productLink, startDate, endDate } = body;

  // Validation
  if (keyword !== undefined && keyword !== null && keyword.length > 10) {
    return NextResponse.json({ error: '키워드는 10자 이내로 입력해주세요.' }, { status: 400 });
  }

  if (productLink !== undefined && productLink !== null && !/^https?:\/\/.+/.test(productLink)) {
    return NextResponse.json({ error: '상품 링크는 http:// 또는 https://로 시작해야 합니다.' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  const isMaster = role === 'MASTER';

  // 광고주는 키워드, 상품 링크, 시작일, 종료일만 수정 가능
  if (keyword !== undefined) updateData.keyword = keyword;
  if (productLink !== undefined) updateData.productLink = productLink;
  if (startDate !== undefined) updateData.startDate = new Date(startDate);
  if (endDate !== undefined) updateData.endDate = new Date(endDate);

  // MASTER만 수정 가능한 필드 (상태, 순위)
  if (isMaster) {
    if (status !== undefined) updateData.status = status;
    if (rank !== undefined) updateData.rank = rank;
  }

  const updated = await prisma.ad.update({
    where: { id: targetId },
    data: updateData,
    include: { advertiser: { select: { username: true } } },
  });

  return NextResponse.json({
    ad: {
      id: updated.id,
      organizationId: updated.organizationId,
      advertiserId: updated.advertiserId,
      advertiserUsername: updated.advertiser.username,
      kind: updated.kind,
      status: updated.status,
      keyword: updated.keyword,
      rank: updated.rank,
      productLink: updated.productLink,
      startDate: updated.startDate.toISOString().split('T')[0],
      endDate: updated.endDate.toISOString().split('T')[0],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
