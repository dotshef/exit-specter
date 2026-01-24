'use client';

import { Role } from '@/types';
import UserDropdown from './UserDropdown';
import Image from "next/image";

interface HeaderProps {
  username: string;
  role: Role;
}

export default function Header({ username, role }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
        <Image
            src="/logo.svg"
            width={60}
            height={60}
            alt="EXIT"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
        />
        <UserDropdown username={username} role={role} />
    </header>
  );
}
