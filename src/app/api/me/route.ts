import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { organization: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name || null,
      memo: user.memo,
    },
  });
}
