'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Ad, Role } from '@/types';

interface AdEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ad: Ad | null;
  currentRole: Role;
}

const STATUS_OPTIONS = [
  { value: 'WAITING', label: '대기' },
  { value: 'ACTIVE', label: '정상' },
  { value: 'ERROR', label: '오류' },
  { value: 'ENDING_SOON', label: '종료예정' },
  { value: 'ENDED', label: '종료' },
];

export default function AdEditModal({ isOpen, onClose, onSuccess, ad, currentRole }: AdEditModalProps) {
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [rank, setRank] = useState<number | ''>('');
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ad) {
      setStatus(ad.status);
      setKeyword(ad.keyword || '');
      setRank(ad.rank ?? '');
      setProductName(ad.productName || '');
      setProductId(ad.productId || '');
      setQuantity(ad.quantity || 0);
      setWorkingDays(ad.workingDays);
      setStartDate(ad.startDate);
      setError('');
    }
  }, [isOpen, ad]);

  function computeEndDate(): string {
    if (!startDate || !workingDays) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + workingDays);
    return start.toISOString().split('T')[0];
  }

  async function handleSubmit() {
    if (!ad) return;
    setError('');
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        status,
        keyword: keyword || null,
        rank: rank === '' ? null : rank,
        productName: productName || null,
        productId: productId || null,
        quantity,
        workingDays,
        startDate,
      };

      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PATCH',
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

  if (!ad) return null;

  const canChangeStatus = currentRole === 'MASTER' || currentRole === 'AGENCY';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="광고 수정"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
          <input
            type="text"
            value={ad.advertiserUsername || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
          {canChangeStatus ? (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={STATUS_OPTIONS.find((o) => o.value === status)?.label || status}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">키워드</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">순위</label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">프로덕트 ID</label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">작업일수</label>
            <input
              type="number"
              value={workingDays}
              onChange={(e) => setWorkingDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종료일 (자동계산)</label>
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
