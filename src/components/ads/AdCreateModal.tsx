'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Role } from '@/types';

interface Advertiser {
  id: number;
  username: string;
}

interface AdCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentRole: Role;
  organizationId: number | null;
}

export default function AdCreateModal({ isOpen, onClose, onSuccess, currentRole, organizationId }: AdCreateModalProps) {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [advertiserId, setAdvertiserId] = useState<number | null>(null);
  const [kind, setKind] = useState<'PAID' | 'TEST'>('PAID');
  const [quantity, setQuantity] = useState<number>(0);
  const [workingDays, setWorkingDays] = useState<number>(30);
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKind('PAID');
      setQuantity(0);
      setWorkingDays(30);
      setStartDate(new Date().toISOString().split('T')[0]);
      setError('');

      // Fetch advertisers for the selector
      const params = currentRole === 'MASTER' ? '' : '?role=ADVERTISER';
      fetch(`/api/accounts${params}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.accounts) {
            const advs = data.accounts.filter((a: { role: string }) => a.role === 'ADVERTISER');
            setAdvertisers(advs);
            if (advs.length > 0) {
              setAdvertiserId(advs[0].id);
            }
          }
        });
    }
  }, [isOpen, currentRole, organizationId]);

  function computeEndDate(): string {
    if (!startDate || !workingDays) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + workingDays);
    return start.toISOString().split('T')[0];
  }

  async function handleSubmit() {
    setError('');

    if (!advertiserId || !workingDays || !startDate) {
      setError('필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiserId,
          kind,
          quantity,
          workingDays,
          startDate,
        }),
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
      title="광고 추가"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '추가 중...' : '추가'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
          {advertisers.length <= 1 ? (
            <input
              type="text"
              value={advertisers[0]?.username || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
            />
          ) : (
            <select
              value={advertiserId || ''}
              onChange={(e) => setAdvertiserId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              {advertisers.map((a) => (
                <option key={a.id} value={a.id}>{a.username}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            결제<span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              type="button"
              onClick={() => setKind('PAID')}
              className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                kind === 'PAID'
                  ? 'bg-[#2E3A4A] text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              결제
            </button>
            <button
              type="button"
              onClick={() => setKind('TEST')}
              className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                kind === 'TEST'
                  ? 'bg-[#2E3A4A] text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              테스트
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            수량<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            일수<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={workingDays}
            onChange={(e) => setWorkingDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            작업 시작일<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">작업 종료일</label>
          <input
            type="text"
            value={computeEndDate()}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
