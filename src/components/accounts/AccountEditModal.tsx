'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { User } from '@/types';

interface AccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: User | null;
}

const ROLE_LABELS: Record<string, string> = {
  MASTER: '총판사',
  AGENCY: '대행사',
  ADVERTISER: '광고주',
};

export default function AccountEditModal({ isOpen, onClose, onSuccess, account }: AccountEditModalProps) {
  const [password, setPassword] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && account) {
      setPassword('');
      setMemo(account.memo || '');
      setError('');
    }
  }, [isOpen, account]);

  async function handleSubmit() {
    if (!account) return;
    setError('');

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, memo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="계정 수정"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '수정 중...' : '수정'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            아이디<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={account.username}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
          <input
            type="text"
            value={ROLE_LABELS[account.role] || account.role}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력해주세요."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
