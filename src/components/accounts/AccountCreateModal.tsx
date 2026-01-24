'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {Organization, Role} from '@/types';
import { getCreateableRoles } from '@/lib/permissions';


interface AccountCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentRole: Role;
}

const ROLE_LABELS: Record<string, string> = {
  AGENCY: '대행사',
  ADVERTISER: '광고주',
};

export default function AccountCreateModal({ isOpen, onClose, onSuccess, currentRole }: AccountCreateModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('');
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [isNewOrg, setIsNewOrg] = useState(false);
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const creatableRoles = getCreateableRoles(currentRole);

  useEffect(() => {
    if (isOpen) {
      const roles = getCreateableRoles(currentRole);
      setUsername('');
      setPassword('');
      setRole(roles[0] || '');
      setOrganizationId(null);
      setOrganizationName('');
      setIsNewOrg(false);
      setMemo('');
      setError('');

      if (currentRole === 'MASTER') {
        fetch('/api/organizations')
          .then((res) => res.json())
          .then((data) => setOrganizations(data.organizations || []));
      }
    }
  }, [isOpen, currentRole]);

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        username,
        password,
        role,
        memo: memo || undefined,
      };

      if (currentRole === 'MASTER' && role !== 'MASTER') {
        if (isNewOrg) {
          body.organizationName = organizationName;
        } else {
          body.organizationId = organizationId;
        }
      }

      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="계정 등록"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>닫기</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '등록 중...' : '등록'}
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="이름을 입력해주세요."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
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
          {creatableRoles.length === 1 ? (
            <input
              type="text"
              value={ROLE_LABELS[creatableRoles[0]] || creatableRoles[0]}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
            />
          ) : (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              {creatableRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
              ))}
            </select>
          )}
        </div>

        {currentRole === 'MASTER' && role !== 'MASTER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">소속 조직</label>
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={!isNewOrg}
                  onChange={() => setIsNewOrg(false)}
                />
                기존 조직
              </label>
              <label className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={isNewOrg}
                  onChange={() => setIsNewOrg(true)}
                />
                새 조직
              </label>
            </div>
            {isNewOrg ? (
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="새 조직 이름을 입력하세요."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            ) : (
              <select
                value={organizationId || ''}
                onChange={(e) => setOrganizationId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              >
                <option value="">조직을 선택하세요</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

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
