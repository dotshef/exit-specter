'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Notice, Role } from '@/types';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { canManageNotices, canViewNotices } from '@/lib/permissions';

function formatDate(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotice = useCallback(async (id: string) => {
    const res = await fetch(`/api/notices/${id}`);
    if (res.ok) {
      const data = await res.json();
      setNotice(data);
    } else if (res.status === 403) {
      router.push('/ads');
    } else if (res.status === 404) {
      addToast('존재하지 않는 공지사항입니다.', 'error');
      router.push('/notices');
    }
  }, [router, addToast]);

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
        const id = params.id as string;
        await fetchNotice(id);
      }
      setLoading(false);
    }
    init();
  }, [fetchNotice, router, params.id]);

  function handleGoToList() {
    router.push('/notices');
  }

  function handleEdit() {
    const id = params.id as string;
    router.push(`/notices/${id}/edit`);
  }

  async function handleDelete() {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    const id = params.id as string;
    const res = await fetch(`/api/notices/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      addToast('공지사항이 삭제되었습니다.', 'success');
      router.push('/notices');
    } else {
      const data = await res.json();
      addToast(data.error || '삭제에 실패했습니다.', 'error');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
        <p className="text-sm text-gray-500 mt-1">
          공지사항 상세 내용을 확인할 수 있습니다.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{notice.title}</h2>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>작성일: {formatDate(notice.createdAt)}</span>
            <span>조회수: {notice.viewCount}</span>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="whitespace-pre-wrap text-gray-700">{notice.content}</div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleGoToList}>
          목록으로
        </Button>
        {currentRole && canManageNotices(currentRole) && (
          <div className="flex gap-2">
            <Button onClick={handleEdit}>수정</Button>
            <Button variant="danger" onClick={handleDelete}>삭제</Button>
          </div>
        )}
      </div>
    </div>
  );
}
