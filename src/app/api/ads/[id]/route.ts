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

  if (role === 'ADVERTISER') {
    return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  const targetId = parseInt(id, 10);

  const ad = await prisma.ad.findUnique({ where: { id: targetId } });

  if (!ad) {
    return NextResponse.json({ error: '광고를 찾을 수 없습니다.' }, { status: 404 });
  }

  if (role === 'AGENCY' && ad.organizationId !== session.organizationId) {
    return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { status, keyword, rank, productName, productId, quantity, workingDays, startDate } = body;

  const updateData: Record<string, unknown> = {};

  if (status !== undefined) updateData.status = status;
  if (keyword !== undefined) updateData.keyword = keyword;
  if (rank !== undefined) updateData.rank = rank;
  if (productName !== undefined) updateData.productName = productName;
  if (productId !== undefined) updateData.productId = productId;
  if (quantity !== undefined) updateData.quantity = quantity;

  // Recompute endDate if startDate or workingDays changed
  const newWorkingDays = workingDays !== undefined ? workingDays : ad.workingDays;
  const newStartDate = startDate !== undefined ? new Date(startDate) : ad.startDate;

  if (workingDays !== undefined || startDate !== undefined) {
    updateData.workingDays = newWorkingDays;
    updateData.startDate = newStartDate;
    const end = new Date(newStartDate);
    end.setDate(end.getDate() + newWorkingDays);
    updateData.endDate = end;
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
      productName: updated.productName,
      productId: updated.productId,
      quantity: updated.quantity,
      workingDays: updated.workingDays,
      startDate: updated.startDate.toISOString().split('T')[0],
      endDate: updated.endDate.toISOString().split('T')[0],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
