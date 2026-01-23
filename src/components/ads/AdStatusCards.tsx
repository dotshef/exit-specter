'use client';

import { AdStatsGroup } from '@/types';

interface AdStatusCardsProps {
  stats: AdStatsGroup;
  selectedFilter: { kind: string | null; status: string | null } | null;
  onFilterChange: (filter: { kind: string | null; status: string | null } | null) => void;
}

interface StatItem {
  label: string;
  value: number;
  kind: string | null;
  status: string | null;
}

function StatusCard({
  title,
  items,
  selectedFilter,
  onSelect,
}: {
  title: string;
  items: StatItem[];
  selectedFilter: { kind: string | null; status: string | null } | null;
  onSelect: (item: StatItem) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex divide-x divide-gray-100">
        {items.map((item) => {
          const isSelected =
            selectedFilter !== null &&
            selectedFilter.kind === item.kind &&
            selectedFilter.status === item.status;
          return (
            <button
              key={`${item.kind}-${item.status}-${item.label}`}
              onClick={() => onSelect(item)}
              className="flex-1 py-5 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span
                className={`text-2xl font-bold ${
                  isSelected ? 'text-blue-500' : 'text-gray-900'
                }`}
              >
                {item.value}
              </span>
              <span
                className={`text-xs ${
                  isSelected ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdStatusCards({ stats, selectedFilter, onFilterChange }: AdStatusCardsProps) {
  function handleSelect(item: StatItem) {
    // If clicking the same filter, deselect
    if (
      selectedFilter &&
      selectedFilter.kind === item.kind &&
      selectedFilter.status === item.status
    ) {
      onFilterChange(null);
      return;
    }
    onFilterChange({ kind: item.kind, status: item.status });
  }

  const allItems: StatItem[] = [
    { label: '전체', value: stats.all.total, kind: null, status: null },
    { label: '정상', value: stats.all.active, kind: null, status: 'ACTIVE' },
    { label: '오류', value: stats.all.error, kind: null, status: 'ERROR' },
    { label: '대기', value: stats.all.waiting, kind: null, status: 'WAITING' },
    { label: '종료예정', value: stats.all.endingSoon, kind: null, status: 'ENDING_SOON' },
    { label: '종료', value: stats.all.ended, kind: null, status: 'ENDED' },
  ];

  const paidItems: StatItem[] = [
    { label: '전체', value: stats.paid.total, kind: 'PAID', status: null },
    { label: '정상', value: stats.paid.active, kind: 'PAID', status: 'ACTIVE' },
    { label: '오류', value: stats.paid.error, kind: 'PAID', status: 'ERROR' },
    { label: '대기', value: stats.paid.waiting, kind: 'PAID', status: 'WAITING' },
    { label: '종료예정', value: stats.paid.endingSoon, kind: 'PAID', status: 'ENDING_SOON' },
    { label: '종료', value: stats.paid.ended, kind: 'PAID', status: 'ENDED' },
  ];

  const testItems: StatItem[] = [
    { label: '전체', value: stats.test.total, kind: 'TEST', status: null },
    { label: '정상', value: stats.test.active, kind: 'TEST', status: 'ACTIVE' },
    { label: '오류', value: stats.test.error, kind: 'TEST', status: 'ERROR' },
    { label: '대기', value: stats.test.waiting, kind: 'TEST', status: 'WAITING' },
    { label: '종료예정', value: stats.test.endingSoon, kind: 'TEST', status: 'ENDING_SOON' },
    { label: '종료', value: stats.test.ended, kind: 'TEST', status: 'ENDED' },
  ];

  return (
    <div className="space-y-4">
      <StatusCard
        title="전체 현황"
        items={allItems}
        selectedFilter={selectedFilter}
        onSelect={handleSelect}
      />
      <div className="grid grid-cols-2 gap-4">
        <StatusCard
          title="광고 현황"
          items={paidItems}
          selectedFilter={selectedFilter}
          onSelect={handleSelect}
        />
        <StatusCard
          title="테스트 현황"
          items={testItems}
          selectedFilter={selectedFilter}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
