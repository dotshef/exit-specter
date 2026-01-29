'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { Role } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  MASTER: '총판사',
  AGENCY: '대행사',
  ADVERTISER: '광고주',
};

interface UserProfile {
  id: number;
  username: string;
  role: Role;
  memo: string | null;
}

export default function ProfilePage() {
  const { addToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMemo(data.user.memo || '');
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    try {
      const body: { memo: string; password?: string } = { memo };
      if (password) {
        body.password = password;
      }

      const res = await fetch(`/api/accounts/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        addToast('프로필이 수정되었습니다.', 'success');
        setPassword('');
      } else {
        const data = await res.json();
        addToast(data.error || '수정에 실패했습니다.', 'error');
      }
    } catch {
      addToast('서버 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">프로필 정보 수정</h1>
      <p className="text-sm text-gray-500 mt-1">비밀번호와 메모를 수정할 수 있습니다. 비밀번호는 변경 시에만 입력하세요.</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            아이디<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={user.username}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="변경 시에만 입력하세요."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
          <input
            type="text"
            value={ROLE_LABELS[user.role]}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="메모를 입력해주세요."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent resize-none"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? '수정 중...' : '수정'}
          </Button>
        </div>
      </form>
    </div>
  );
}
