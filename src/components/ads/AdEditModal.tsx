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
  const [quantity, setQuantity] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ad) {
      setStatus(ad.status);
      setKeyword(ad.keyword || '');
      setRank(ad.rank ?? '');
      setProductName(ad.productName || '');
      setQuantity(ad.quantity || 0);
      setStartDate(ad.startDate);
      setEndDate(ad.endDate);
      setError('');
    }
  }, [isOpen, ad]);

  function computeWorkingDays(): number {
    if (!endDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
        quantity,
        startDate,
        endDate,
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

  const isAdmin = currentRole === 'MASTER' || currentRole === 'AGENCY';

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
          {isAdmin ? (
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
            {isAdmin ? (
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            ) : (
              <input
                type="text"
                value={rank === '' ? '-' : rank}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수량</label>
            {isAdmin ? (
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
              />
            ) : (
              <input
                type="text"
                value={quantity}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
              />
            )}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">남은작업일수</label>
          <input
            type="text"
            value={computeWorkingDays()}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
