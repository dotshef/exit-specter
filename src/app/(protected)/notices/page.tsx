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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotices = useCallback(async (page = 1) => {
    const res = await fetch(`/api/notices?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      setNotices(data.notices);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
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

  return (
    <div className="max-w-4xl mx-auto">
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

      <NoticeTable notices={notices} loading={loading} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          fetchNotices(page);
        }}
      />
    </div>
  );
}
