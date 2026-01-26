'use client';

import { useRouter } from 'next/navigation';
import { Role } from '@/types';
import Image from "next/image";

interface HeaderProps {
  username: string;
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  MASTER: '총판사',
  AGENCY: '대행사',
  ADVERTISER: '광고주',
};

export default function Header({ username, role }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <header className="fixed top-0 left-2 right-0 h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
      <Image
        src="/home.png"
        width={100}
        height={100}
        alt="EXIT"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-900 font-medium">{username}</span>
          <span className="text-gray-500">({ROLE_LABEL[role]})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/profile')}
            className="px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded cursor-pointer transition-colors"
          >
            프로필 수정
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded cursor-pointer transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
