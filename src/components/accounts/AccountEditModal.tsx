'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Role } from '@/types';
import { validatePassword } from '@/lib/validation';

interface AccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: number | null;
  currentRole: Role;
}

interface AccountDetail {
  id: number;
  username: string;
  nickname: string | null;
  memo: string | null;
  role: string;
  organizationCount?: number; // 총판인 경우 관리하는 조직 수
}

const ROLE_LABELS: Record<string, string> = {
  MASTER: '총판',
  AGENCY: '대행사',
  ADVERTISER: '광고주',
};

export default function AccountEditModal({
  isOpen,
  onClose,
  onSuccess,
  accountId,
  currentRole,
}: AccountEditModalProps) {
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [nickname, setNickname] = useState('');
  const [memo, setMemo] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 삭제 확인 모달 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && accountId) {
      setLoading(true);
      setError('');
      setChangePassword(false);
      setPassword('');
      setPasswordConfirm('');
      setShowDeleteConfirm(false);
      setDeleteError('');

      fetch(`/api/accounts/${accountId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.account) {
            setAccount(data.account);
            setNickname(data.account.nickname || '');
            setMemo(data.account.memo || '');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setAccount(null);
      setNickname('');
      setMemo('');
      setPassword('');
      setPasswordConfirm('');
      setChangePassword(false);
    }
  }, [isOpen, accountId]);

  async function handleSubmit() {
    if (!accountId) return;

    setError('');

    // Client-side password validation
    if (changePassword && password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setError(passwordValidation.error || '');
        return;
      }
      if (password !== passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        nickname,
        memo: memo || null,
      };

      if (changePassword && password) {
        body.password = password;
      }

      const res = await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '수정에 실패했습니다.');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!accountId || !account) return;

    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        // 총판 삭제 불가 (조직이 있는 경우)
        if (res.status === 409) {
          setDeleteError(data.error || '삭제할 수 없습니다.');
          return;
        }
        setDeleteError(data.error || '삭제에 실패했습니다.');
        return;
      }

      setShowDeleteConfirm(false);
      onSuccess();
      onClose();
    } catch {
      setDeleteError('서버 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  }

  function handleDeleteClick() {
    if (!account) return;

    // 총판이고 조직이 없는 경우 바로 삭제
    if (account.role === 'MASTER' && account.organizationCount === 0) {
      handleDelete();
      return;
    }

    // 그 외의 경우 확인 모달 표시
    setShowDeleteConfirm(true);
    setDeleteError('');
  }

  // 총판 삭제 불가 메시지 (조직이 있는 경우)
  const isMasterWithOrgs = account?.role === 'MASTER' && (account?.organizationCount || 0) > 0;

  // 삭제 버튼 표시 여부 (MASTER만 삭제 가능, 또는 AGENCY가 광고주 삭제)
  const canDelete =
    currentRole === 'MASTER' ||
    (currentRole === 'AGENCY' && account?.role === 'ADVERTISER');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="계정 수정"
        footer={
          <div className="flex justify-between w-full">
            {canDelete ? (
              <Button
                variant="outline"
                onClick={handleDeleteClick}
                className="!text-red-600 !border-red-300 hover:!bg-red-50"
              >
                삭제
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="text-center py-4 text-gray-500">로딩 중...</div>
        ) : account ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">아이디</label>
              <input
                type="text"
                value={account.username}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">역할</label>
              <input
                type="text"
                value={ROLE_LABELS[account.role] || account.role}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력해주세요."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="rounded"
                />
                비밀번호 변경
              </label>
              {changePassword && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="새 비밀번호를 입력해주세요."
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-security-disc"
                  />
                  <input
                    type="text"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="새 비밀번호를 한 번 더 입력해주세요."
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-security-disc"
                  />
                </div>
              )}
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
        ) : (
          <div className="text-center py-4 text-gray-500">계정 정보를 불러올 수 없습니다.</div>
        )}
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="계정 삭제"
        footer={
          isMasterWithOrgs ? (
            <Button onClick={() => setShowDeleteConfirm(false)}>확인</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                취소
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="!bg-red-600 hover:!bg-red-700"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          )
        }
      >
        {isMasterWithOrgs ? (
          <p className="text-gray-700">
            관리하고 있는 조직이 있는 총판은 삭제할 수 없습니다.
          </p>
        ) : (
          <p className="text-gray-700">
            정말 삭제하시겠습니까? 사용자와 연결된 모든 광고가 제거됩니다.
          </p>
        )}
        {deleteError && <p className="text-sm text-red-600 mt-2">{deleteError}</p>}
      </Modal>
    </>
  );
}
