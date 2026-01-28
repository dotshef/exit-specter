'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Notice, Role } from '@/types';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import NoticeTable from '@/components/notices/NoticeTable';
import { canManageNotices, canViewNotices } from '@/lib/permissions';

export default function NoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    const res = await fetch('/api/notices');
    if (res.ok) {
      const data = await res.json();
      setNotices(data.notices);
    } else if (res.status === 403) {
      router.push('/ads');
    }
  }, [router]);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        const role = meData.user.role as Role;
        setCurrentRole(role);
        if (!canViewNotices(role)) {
          router.push('/ads');
          return;
        }
        await fetchNotices();
      }
      setLoading(false);
    }
    init();
  }, [fetchNotices, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
        <p className="text-sm text-gray-500 mt-1">
          공지사항을 확인할 수 있습니다.
        </p>
      </div>

      {currentRole && canManageNotices(currentRole) && (
        <div className="flex justify-end gap-2 mb-3">
          <Button onClick={() => router.push('/notices/new')}>등록</Button>
        </div>
      )}

      <NoticeTable notices={notices} />

      <Pagination />
    </div>
  );
}
