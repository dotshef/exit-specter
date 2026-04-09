'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { Role } from '@/types';
import { validatePassword } from '@/lib/validation';
import {ROLE_LABELS} from "@/components/util/RoleLabel";

interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  role: Role;
  memo: string | null;
}

export default function ProfilePage() {
  const { addToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setNickname(data.user.nickname || '');
        setMemo(data.user.memo || '');
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!nickname.trim()) {
      addToast('닉네임을 입력해주세요.', 'error');
      return;
    }

    // Client-side password validation
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        addToast(passwordValidation.error || '비밀번호 오류', 'error');
        return;
      }
      if (password !== passwordConfirm) {
        addToast('비밀번호가 일치하지 않습니다.', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const body: { nickname: string; memo: string; password?: string } = { nickname, memo };
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
        setPasswordConfirm('');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">프로필 정보 수정</h1>
        <p className="text-sm text-gray-500 mt-1">
          닉네임, 비밀번호, 메모를 수정할 수 있습니다.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                아이디
              </label>
              <input
                type="text"
                value={user.username}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                권한
              </label>
              <input
                type="text"
                value={ROLE_LABELS[user.role]}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                닉네임<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력해주세요."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
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
                placeholder="변경 시에만 입력 (8자 이상)"
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 한 번 더 입력해주세요."
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
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

            <div className="pt-2 flex justify-center">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '수정 중...' : '수정'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
