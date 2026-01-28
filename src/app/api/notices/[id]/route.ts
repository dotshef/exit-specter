import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Role } from '@/types';
import { canViewNotices, canManageNotices } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (!canViewNotices(role)) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  const noticeId = parseInt(id, 10);

  if (isNaN(noticeId)) {
    return NextResponse.json({ error: '유효하지 않은 공지사항 ID입니다.' }, { status: 400 });
  }

  // edit 모드에서는 조회수 증가하지 않음
  const isEditMode = request.nextUrl.searchParams.get('edit') === 'true';

  let notice;
  if (isEditMode) {
    notice = await prisma.notice.findUnique({
      where: { id: noticeId },
    });
  } else {
    notice = await prisma.notice.update({
      where: { id: noticeId },
      data: { viewCount: { increment: 1 } },
    }).catch(() => null);
  }

  if (!notice) {
    return NextResponse.json({ error: '존재하지 않는 공지사항입니다.' }, { status: 404 });
  }

  return NextResponse.json({
    id: notice.id,
    title: notice.title,
    content: notice.content,
    viewCount: notice.viewCount,
    createdAt: notice.createdAt.toISOString(),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (!canManageNotices(role)) {
    return NextResponse.json({ error: '공지사항 수정 권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  const noticeId = parseInt(id, 10);

  if (isNaN(noticeId)) {
    return NextResponse.json({ error: '유효하지 않은 공지사항 ID입니다.' }, { status: 400 });
  }

  const existing = await prisma.notice.findUnique({ where: { id: noticeId } });
  if (!existing) {
    return NextResponse.json({ error: '존재하지 않는 공지사항입니다.' }, { status: 404 });
  }

  const body = await request.json();
  const { title, content } = body;

  const updateData: { title?: string; content?: string } = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: '제목은 빈 문자열일 수 없습니다.' }, { status: 400 });
    }
    updateData.title = title.trim();
  }

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: '본문은 빈 문자열일 수 없습니다.' }, { status: 400 });
    }
    updateData.content = content.trim();
  }

  const notice = await prisma.notice.update({
    where: { id: noticeId },
    data: updateData,
  });

  return NextResponse.json({
    id: notice.id,
    title: notice.title,
    content: notice.content,
    viewCount: notice.viewCount,
    createdAt: notice.createdAt.toISOString(),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const role = session.role as Role;

  if (!canManageNotices(role)) {
    return NextResponse.json({ error: '공지사항 삭제 권한이 없습니다.' }, { status: 403 });
  }

  const { id } = await params;
  const noticeId = parseInt(id, 10);

  if (isNaN(noticeId)) {
    return NextResponse.json({ error: '유효하지 않은 공지사항 ID입니다.' }, { status: 400 });
  }

  const existing = await prisma.notice.findUnique({ where: { id: noticeId } });
  if (!existing) {
    return NextResponse.json({ error: '존재하지 않는 공지사항입니다.' }, { status: 404 });
  }

  await prisma.notice.delete({ where: { id: noticeId } });

  return NextResponse.json({ message: '공지사항이 삭제되었습니다.' });
}
