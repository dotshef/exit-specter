import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  if (session.role !== 'MASTER') {
    return NextResponse.json({ error: '조직 생성 권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { name, masterId } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: '조직명을 입력해주세요.' }, { status: 400 });
  }

  // 조직명 중복 체크
  const existing = await prisma.organization.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: '이미 존재하는 조직명입니다.' }, { status: 400 });
  }

  // masterId가 없으면 현재 로그인한 MASTER를 할당
  const assignedMasterId = masterId || session.id;

  const organization = await prisma.organization.create({
    data: {
      name: name.trim(),
      masterId: assignedMasterId,
    },
    include: {
      master: { select: { id: true, username: true, nickname: true } },
    },
  });

  return NextResponse.json({
    organization: {
      id: organization.id,
      name: organization.name,
      masterId: organization.masterId,
      masterNickname: organization.master?.nickname || organization.master?.username || null,
    },
  }, { status: 201 });
}
