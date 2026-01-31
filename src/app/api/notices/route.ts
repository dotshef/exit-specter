import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';
import { canViewNotices, canManageNotices } from '@/lib/permissions';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (!canViewNotices(role)) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const totalCount = await prisma.notice.count();
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const notices = await prisma.notice.findMany({
    orderBy: { id: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      author: {
        select: { nickname: true },
      },
    },
  });

  const formattedNotices = notices.map((n) => ({
    id: n.id,
    title: n.title,
    authorNickname: n.author?.nickname || '-',
    viewCount: n.viewCount,
    createdAt: n.createdAt.toISOString(),
  }));

  return NextResponse.json({ notices: formattedNotices, pagination: { page, totalPages, totalCount } });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (!canManageNotices(role)) {
    return NextResponse.json({ error: '공지사항 등록 권한이 없습니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { title, content } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
  }

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json({ error: '본문을 입력해주세요.' }, { status: 400 });
  }

  const notice = await prisma.notice.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      authorId: session.id,
    },
  });

  return NextResponse.json({
    id: notice.id,
    title: notice.title,
    content: notice.content,
    viewCount: notice.viewCount,
    createdAt: notice.createdAt.toISOString(),
  }, { status: 201 });
}
