'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Role } from '@/types';
import { getSidebarItems, getRedirectPath } from '@/lib/permissions';

interface SidebarProps {
  role: Role;
  username: string;
}

function MenuIcon({ type }: { type: string }) {
  if (type === 'notices') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  }
  if (type === 'accounts') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export default function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = getSidebarItems(role);
  const dashboardPath = getRedirectPath(role);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <Link
        href={dashboardPath}
        className="flex items-center justify-center px-5 py-6 border-b border-gray-200"
      >
        <Image
          src="/logo.png"
          width={120}
          height={40}
          alt="EXIT"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </Link>

      {/* Menu Label */}
      <div className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        MENU
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mb-1 text-sm transition-colors rounded-lg ${
                isActive
                  ? 'bg-[var(--primary)] text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MenuIcon type={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer to push profile/logout to bottom */}
      <div className="flex-1" />

      {/* Profile Section */}
      <div className="border-t border-gray-200 px-3 py-8">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ProfileIcon />
          <span className="truncate max-w-[150px]">{username}</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <LogoutIcon />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
