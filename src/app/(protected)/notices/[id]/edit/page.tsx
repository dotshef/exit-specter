'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Role } from '@/types';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { canManageNotices } from '@/lib/permissions';

export default function NoticeEditPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        const role = meData.user.role as Role;
        if (!canManageNotices(role)) {
          addToast('공지사항 수정 권한이 없습니다.', 'error');
          router.push('/notices');
          return;
        }

        // Fetch notice data without incrementing view count
        const id = params.id as string;
        const res = await fetch(`/api/notices/${id}?edit=true`);
        if (res.ok) {
          const notice = await res.json();
          setTitle(notice.title);
          setContent(notice.content);
        } else if (res.status === 404) {
          addToast('존재하지 않는 공지사항입니다.', 'error');
          router.push('/notices');
          return;
        }
      }
      setInitialLoading(false);
    }
    init();
  }, [router, params.id, addToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('본문을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const id = params.id as string;
      const res = await fetch(`/api/notices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      addToast('공지사항이 수정되었습니다.', 'success');
      router.push(`/notices/${id}`);
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">공지사항 수정</h1>
        <p className="text-sm text-gray-500 mt-1">
          공지사항을 수정합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              본문<span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="본문을 입력해주세요."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => router.push(`/notices/${params.id}`)}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '수정 중...' : '수정'}
          </Button>
        </div>
      </form>
    </div>
  );
}
