'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/types';
import { getSidebarItems } from '@/lib/permissions';

interface SidebarProps {
  role: Role;
}

function MenuIcon({ type }: { type: string }) {
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

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = getSidebarItems(role);

  return (
    <aside className="fixed left-0 top-[56px] bottom-0 w-[240px] bg-[#2E3A4A] text-white flex flex-col">
      <div className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        MAIN MENU
      </div>
      <nav className="flex-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MenuIcon type={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
