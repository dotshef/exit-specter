'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Role } from '@/types';

interface AdBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCount: number) => void;
  selectedIds: number[];
  currentRole: Role;
}

const STATUS_OPTIONS = [
  { value: 'WAITING', label: '대기' },
  { value: 'ACTIVE', label: '정상' },
  { value: 'ERROR', label: '오류' },
  { value: 'ENDING_SOON', label: '종료예정' },
  { value: 'ENDED', label: '종료' },
];

export default function AdBulkEditModal({ isOpen, onClose, onSuccess, selectedIds, currentRole }: AdBulkEditModalProps) {
  const isMaster = currentRole === 'MASTER';

  const [applyStatus, setApplyStatus] = useState(false);
  const [applyKeyword, setApplyKeyword] = useState(false);
  const [applyRank, setApplyRank] = useState(false);
  const [applyProductLink, setApplyProductLink] = useState(false);
  const [applyStartDate, setApplyStartDate] = useState(false);
  const [applyEndDate, setApplyEndDate] = useState(false);

  const [status, setStatus] = useState('WAITING');
  const [keyword, setKeyword] = useState('');
  const [rank, setRank] = useState<number | ''>('');
  const [productLink, setProductLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApplyStatus(false);
      setApplyKeyword(false);
      setApplyRank(false);
      setApplyProductLink(false);
      setApplyStartDate(false);
      setApplyEndDate(false);
      setStatus('WAITING');
      setKeyword('');
      setRank('');
      setProductLink('');
      setStartDate('');
      setEndDate('');
      setError('');
    }
  }, [isOpen]);

  function isValidUrl(url: string): boolean {
    return /^https?:\/\/.+/.test(url);
  }

  async function handleSubmit() {
    setError('');

    const data: Record<string, unknown> = {};
    if (isMaster && applyStatus) data.status = status;
    if (applyKeyword) data.keyword = keyword || null;
    if (isMaster && applyRank) data.rank = rank === '' ? null : rank;
    if (applyProductLink) data.productLink = productLink || null;
    if (applyStartDate) data.startDate = startDate;
    if (applyEndDate) data.endDate = endDate;

    if (Object.keys(data).length === 0) {
      setError('수정할 항목을 선택해주세요.');
      return;
    }

    if (applyKeyword && keyword.length > 10) {
      setError('키워드는 10자 이내로 입력해주세요.');
      return;
    }
    if (applyProductLink && productLink && !isValidUrl(productLink)) {
      setError('상품 링크는 http:// 또는 https://로 시작해야 합니다.');
      return;
    }
    if (applyStartDate && !startDate) {
      setError('시작일을 입력해주세요.');
      return;
    }
    if (applyEndDate && !endDate) {
      setError('종료일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error);
        return;
      }
      onSuccess(resData.updatedCount);
      onClose();
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`일괄 수정 (${selectedIds.length}개)`}
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
        <p className="text-xs text-gray-500">
          체크한 항목만 선택한 광고들에 일괄 적용됩니다. 체크하지 않은 항목은 기존 값이 유지됩니다.
        </p>

        {isMaster && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <input type="checkbox" checked={applyStatus} onChange={(e) => setApplyStatus(e.target.checked)} className="rounded cursor-pointer" />
              상태
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!applyStatus}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100 disabled:text-gray-400"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <input type="checkbox" checked={applyKeyword} onChange={(e) => setApplyKeyword(e.target.checked)} className="rounded cursor-pointer" />
            키워드 (최대 10자)
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => { if (e.target.value.length <= 10) setKeyword(e.target.value); }}
            disabled={!applyKeyword}
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>

        {isMaster && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <input type="checkbox" checked={applyRank} onChange={(e) => setApplyRank(e.target.checked)} className="rounded cursor-pointer" />
              순위
            </label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={!applyRank}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <input type="checkbox" checked={applyProductLink} onChange={(e) => setApplyProductLink(e.target.checked)} className="rounded cursor-pointer" />
            상품 링크
          </label>
          <input
            type="url"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            disabled={!applyProductLink}
            placeholder="https://"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <input type="checkbox" checked={applyStartDate} onChange={(e) => setApplyStartDate(e.target.checked)} className="rounded cursor-pointer" />
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!applyStartDate}
              min={tomorrow}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <input type="checkbox" checked={applyEndDate} onChange={(e) => setApplyEndDate(e.target.checked)} className="rounded cursor-pointer" />
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!applyEndDate}
              min={tomorrow}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
