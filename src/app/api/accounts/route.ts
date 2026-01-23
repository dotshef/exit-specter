import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (role === 'ADVERTISER') {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const roleFilter = searchParams.get('role');

  let where: Record<string, unknown> = {};

  if (role === 'AGENCY') {
    where = { organizationId: session.organizationId, role: 'ADVERTISER' };
  }

  if (roleFilter) {
    where = { ...where, role: roleFilter };
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      organization: true,
      _count: { select: { ads: true } },
    },
    orderBy: { id: 'desc' },
  });

  const accounts = users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    organizationId: u.organizationId,
    organizationName: u.organization?.name || null,
    memo: u.memo,
    createdAt: u.createdAt.toISOString(),
    adCount: u._count.ads,
  }));

  // Calculate stats based on the unfiltered dataset for the user's scope
  let statsWhere: Record<string, unknown> = {};
  if (role === 'AGENCY') {
    statsWhere = { organizationId: session.organizationId, role: 'ADVERTISER' };
  }

  const allUsers = roleFilter
    ? await prisma.user.findMany({ where: statsWhere })
    : users;

  const statsSource = roleFilter ? allUsers : users;

  const stats = {
    total: statsSource.length,
    master: statsSource.filter((u) => u.role === 'MASTER').length,
    agency: statsSource.filter((u) => u.role === 'AGENCY').length,
    advertiser: statsSource.filter((u) => u.role === 'ADVERTISER').length,
  };

  return NextResponse.json({ accounts, stats });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const currentRole = session.role as Role;

  if (currentRole === 'ADVERTISER') {
    return NextResponse.json({ error: '계정 등록 권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { username, password, role, organizationId, organizationName, memo } = body;

  if (!username || !password || !role) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  // Permission check: MASTER can create AGENCY/ADVERTISER, AGENCY can only create ADVERTISER
  if (currentRole === 'AGENCY' && role !== 'ADVERTISER') {
    return NextResponse.json({ error: '계정 등록 권한이 없습니다.' }, { status: 403 });
  }

  // Check username uniqueness
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: '이미 존재하는 아이디입니다.' }, { status: 400 });
  }

  // Determine organizationId
  let assignedOrgId: number | null = null;
  let assignedOrgName: string | null = null;

  if (role === 'MASTER') {
    assignedOrgId = null;
  } else if (currentRole === 'AGENCY') {
    // AGENCY creates ADVERTISER in their own org
    assignedOrgId = session.organizationId;
  } else if (currentRole === 'MASTER') {
    if (organizationName) {
      // Create new organization
      const newOrg = await prisma.organization.create({
        data: { name: organizationName },
      });
      assignedOrgId = newOrg.id;
      assignedOrgName = newOrg.name;
    } else if (organizationId) {
      assignedOrgId = organizationId;
    } else {
      return NextResponse.json({ error: '소속 조직을 선택해주세요.' }, { status: 400 });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role,
      organizationId: assignedOrgId,
      memo: memo || null,
    },
    include: { organization: true },
  });

  return NextResponse.json({
    account: {
      id: user.id,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: assignedOrgName || user.organization?.name || null,
      memo: user.memo,
      createdAt: user.createdAt.toISOString(),
    },
  }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const currentRole = session.role as Role;

  if (currentRole === 'ADVERTISER') {
    return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
  }

  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: '삭제할 계정을 선택해주세요.' }, { status: 400 });
  }

  // Prevent self-deletion
  if (ids.includes(session.id)) {
    return NextResponse.json({ error: '자기 자신은 삭제할 수 없습니다.' }, { status: 400 });
  }

  let where: Record<string, unknown> = { id: { in: ids } };

  if (currentRole === 'AGENCY') {
    // AGENCY can only delete ADVERTISER in their org
    where = {
      ...where,
      organizationId: session.organizationId,
      role: 'ADVERTISER',
    };
  }

  const result = await prisma.user.deleteMany({ where });

  return NextResponse.json({ deletedCount: result.count });
}
