'use client';

import { Ad } from '@/types';

interface AdTableProps {
  ads: Ad[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (ad: Ad) => void;
  showManage: boolean;
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

export default function AdTable({ ads, selectedIds, onSelectionChange, onEdit, showManage }: AdTableProps) {
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
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="rounded cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">No</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">아이디</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">상태</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">키워드</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">순위</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">상품명</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">프로덕트ID</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">작업일수</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">시작일</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">종료일</th>
              {showManage && (
                <th className="w-14 px-3 py-3 text-center font-medium text-gray-600">관리</th>
              )}
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td colSpan={showManage ? 12 : 11} className="px-3 py-8 text-center text-gray-400">
                  등록된 광고가 없습니다.
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(ad.id)}
                      onChange={() => handleSelectOne(ad.id)}
                      className="rounded cursor-pointer"
                    />
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
                  <td className="px-3 py-3 text-gray-600">{ad.productName || '-'}</td>
                  <td className="px-3 py-3 text-gray-600">{ad.productId || '-'}</td>
                  <td className="px-3 py-3 text-gray-600">{ad.workingDays}</td>
                  <td className="px-3 py-3 text-gray-600">{ad.startDate}</td>
                  <td className="px-3 py-3 text-gray-600">{ad.endDate}</td>
                  {showManage && (
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => onEdit(ad)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
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
