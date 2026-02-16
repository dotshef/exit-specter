'use client';

import { Ad } from '@/types';
import GearIcon from '@/components/ui/GearIcon';

interface AdTableProps {
  ads: Ad[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (ad: Ad) => void;
  showCheckbox: boolean;
  showEdit: boolean;
}

function calculateRemainingDays(endDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

const STATUS_LABELS: Record<string, string> = {
  WAITING: '대기',
  ACTIVE: '정상',
  ERROR: '오류',
  ENDING_SOON: '종료예정',
  ENDED: '종료',
};

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'text-yellow-600',
  ACTIVE: 'text-green-600',
  ERROR: 'text-red-600',
  ENDING_SOON: 'text-orange-500',
  ENDED: 'text-gray-500',
};

export default function AdTable({ ads, selectedIds, onSelectionChange, onEdit, showCheckbox, showEdit }: AdTableProps) {
  const allSelected = ads.length > 0 && selectedIds.length === ads.length;

  function handleSelectAll() {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(ads.map((a) => a.id));
    }
  }

  function handleSelectOne(id: number) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-2 text-sm text-gray-600">
        ✓ {selectedIds.length}개 선택됨
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-3 py-3">
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded cursor-pointer"
                  />
                )}
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">No</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">아이디</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">상태</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">키워드</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">순위</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">상품 링크</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">남은작업일수</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">시작일</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">종료일</th>
              {showEdit && <th className="w-14 px-3 py-3 text-center font-medium text-gray-600">관리</th>}
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-gray-400">
                  등록된 광고가 없습니다.
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-center">
                    {showCheckbox && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ad.id)}
                        onChange={() => handleSelectOne(ad.id)}
                        className="rounded cursor-pointer"
                      />
                    )}
                  </td>
                  <td className="px-3 py-3 text-gray-600">{ad.id}</td>
                  <td className="px-3 py-3 text-gray-900">{ad.advertiserUsername}</td>
                  <td className="px-3 py-3">
                    <span className={`font-medium ${STATUS_STYLES[ad.status] || ''}`}>
                      {STATUS_LABELS[ad.status] || ad.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{ad.keyword || '-'}</td>
                  <td className="px-3 py-3 text-gray-600">{ad.rank ?? '-'}</td>
                  <td className="px-3 py-3 text-gray-600">
                    {ad.productLink ? (
                      <a
                        href={ad.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-[150px]"
                        title={ad.productLink}
                      >
                        링크
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-3 text-gray-600">{calculateRemainingDays(ad.endDate)}</td>
                  <td className="px-3 py-3 text-gray-600">{ad.startDate}</td>
                  <td className="px-3 py-3 text-gray-600">{ad.endDate}</td>
                  {showEdit && (
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => onEdit(ad)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <GearIcon className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
