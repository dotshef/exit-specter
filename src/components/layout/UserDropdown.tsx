'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/types';

interface UserDropdownProps {
  username: string;
  role: Role;
}

const ROLE_LABEL: Record<Role, string> = {
  MASTER: '총판사',
  AGENCY: '대행사',
  ADVERTISER: '광고주',
};

export default function UserDropdown({ username, role }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
      >
        {username}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-lg shadow-sm border py-2 z-50">
          <div className="px-4 py-2">
            <p className="font-semibold text-center text-sm text-gray-900">{username}</p>
            <p className="text-xs text-center text-gray-500">{ROLE_LABEL[role]}</p>
          </div>

          <div className="px-[10px]">
            <div className="border-t border-gray-200" />
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/profile');
            }}
            className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            프로필 수정
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
