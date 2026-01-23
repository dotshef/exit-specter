import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setSessionCookie } from '@/lib/auth';
import { getRedirectPath } from '@/lib/permissions';
import { Role } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const role = user.role as Role;
    const token = await signToken({
      id: user.id,
      username: user.username,
      role,
      organizationId: user.organizationId,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name || null,
      },
      redirectTo: getRedirectPath(role),
    });
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
