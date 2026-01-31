import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;
  const { searchParams } = new URL(request.url);
  const masterId = searchParams.get('masterId');
  const organizationId = searchParams.get('organizationId');

  // MASTER: 선택한 총판의 조직들과 계정 조회
  if (role === 'MASTER') {
    // 총판 목록 조회 (조직 개수 포함)
    const masters = await prisma.user.findMany({
      where: { role: 'MASTER' },
      select: {
        id: true,
        username: true,
        nickname: true,
        _count: {
          select: { managedOrganizations: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    const mastersWithCount = masters.map((m) => ({
      id: m.id,
      username: m.username,
      nickname: m.nickname,
      organizationCount: m._count.managedOrganizations,
    }));

    // 특정 총판이 선택된 경우 해당 조직들 조회
    let organizations: Array<{
      id: number;
      name: string;
      agencies: Array<{ id: number; nickname: string | null; username: string; memo: string | null }>;
      advertisers: Array<{ id: number; nickname: string | null; username: string; memo: string | null }>;
    }> = [];

    if (masterId) {
      const orgs = await prisma.organization.findMany({
        where: { masterId: parseInt(masterId, 10) },
        include: {
          users: {
            select: { id: true, nickname: true, username: true, memo: true, role: true },
            orderBy: { id: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });

      organizations = orgs.map((org) => ({
        id: org.id,
        name: org.name,
        agencies: org.users
          .filter((u) => u.role === 'AGENCY')
          .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
        advertisers: org.users
          .filter((u) => u.role === 'ADVERTISER')
          .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
      }));
    }

    // 특정 조직이 선택된 경우 해당 조직의 계정만 반환
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: parseInt(organizationId, 10) },
        include: {
          master: { select: { id: true, nickname: true } },
          users: {
            select: { id: true, nickname: true, username: true, memo: true, role: true },
            orderBy: [{ role: 'asc' }, { id: 'asc' }],
          },
        },
      });

      if (org) {
        return NextResponse.json({
          masters: mastersWithCount,
          organization: {
            id: org.id,
            name: org.name,
            master: org.master,
            agencies: org.users
              .filter((u) => u.role === 'AGENCY')
              .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
            advertisers: org.users
              .filter((u) => u.role === 'ADVERTISER')
              .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
          },
        });
      }
    }

    return NextResponse.json({ masters: mastersWithCount, organizations });
  }

  // AGENCY: 본인 소속 조직의 총판, 대행사, 광고주 조회
  if (role === 'AGENCY') {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId! },
      include: {
        master: { select: { id: true, nickname: true } },
        users: {
          select: { id: true, nickname: true, username: true, memo: true, role: true },
          orderBy: [{ role: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: '소속 조직을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        master: org.master,
        agencies: org.users
          .filter((u) => u.role === 'AGENCY')
          .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
        advertisers: org.users
          .filter((u) => u.role === 'ADVERTISER')
          .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
      },
    });
  }

  // ADVERTISER: 본인 소속 조직의 대행사 + 자기자신만 조회
  if (role === 'ADVERTISER') {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId! },
      include: {
        master: { select: { id: true, nickname: true } },
        users: {
          where: {
            OR: [
              { role: 'AGENCY' },
              { id: session.id }, // 자기 자신만
            ],
          },
          select: { id: true, nickname: true, username: true, memo: true, role: true },
          orderBy: [{ role: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: '소속 조직을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        master: org.master,
        agencies: org.users
          .filter((u) => u.role === 'AGENCY')
          .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
        advertisers: org.users
          .filter((u) => u.role === 'ADVERTISER')
          .map((u) => ({ id: u.id, nickname: u.nickname, username: u.username, memo: u.memo })),
      },
    });
  }

  return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
}
