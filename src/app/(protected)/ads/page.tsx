'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Ad, Role, AdStatsGroup } from '@/types';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import AdStatusCards from '@/components/ads/AdStatusCards';
import AdTable from '@/components/ads/AdTable';
import AdEditModal from '@/components/ads/AdEditModal';
import { useToast } from '@/hooks/useToast';
import { isWeekendKST } from '@/lib/date';

const emptyStats: AdStatsGroup = {
  all: { total: 0, active: 0, error: 0, waiting: 0, endingSoon: 0, ended: 0 },
  paid: { total: 0, active: 0, error: 0, waiting: 0, endingSoon: 0, ended: 0 },
  test: { total: 0, active: 0, error: 0, waiting: 0, endingSoon: 0, ended: 0 },
};

export default function AdsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdStatsGroup>(emptyStats);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<{ kind: string | null; status: string | null } | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('ADVERTISER');
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAds = useCallback(async (filter?: { kind: string | null; status: string | null } | null, page = 1) => {
    const params = new URLSearchParams();
    if (filter?.status) params.set('status', filter.status);
    if (filter?.kind) params.set('kind', filter.kind);
    params.set('page', page.toString());
    const query = `?${params.toString()}`;

    const res = await fetch(`/api/ads${query}`);
    if (res.ok) {
      const data = await res.json();
      setAds(data.ads);
      setStats(data.stats);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        setCurrentRole(meData.user.role as Role);
      }
      await fetchAds();
    }
    init();
  }, [fetchAds]);

  function handleFilterChange(filter: { kind: string | null; status: string | null } | null) {
    setSelectedFilter(filter);
    setSelectedIds([]);
    setCurrentPage(1);
    fetchAds(filter, 1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    setSelectedIds([]);
    fetchAds(selectedFilter, page);
  }

  async function handleDelete() {
    if (selectedIds.length === 0) {
      addToast('삭제할 광고를 선택해주세요.', 'error');
      return;
    }

    const res = await fetch('/api/ads', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });

    const data = await res.json();

    if (res.ok) {
      addToast(`${data.deletedCount}개 광고가 삭제되었습니다.`, 'success');
      setSelectedIds([]);
      setSelectedFilter(null);
      setCurrentPage(1);
      fetchAds(null, 1);
    } else {
      addToast(data.error, 'error');
    }
  }

  function handleEditSuccess() {
    addToast('광고가 수정되었습니다.', 'success');
    fetchAds(selectedFilter, currentPage);
  }

  const canCreate = currentRole === 'MASTER' || currentRole === 'AGENCY';
  const canDelete = currentRole === 'MASTER';
  const isWeekend = isWeekendKST();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">광고관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          진행 중인 광고의 연장·수정·삭제 등의 관리 작업을 할 수 있습니다.
        </p>
      </div>

      <div className="mb-6">
        <AdStatusCards
          stats={stats}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {(canCreate || canDelete) && (
        <div className="flex justify-end gap-2 mb-3">
          {canDelete && <Button variant="outline" onClick={handleDelete}>삭제</Button>}
          {canCreate && (
            <Button
              onClick={() => router.push('/ads/create')}
              disabled={isWeekend}
              title={isWeekend ? '주말에는 광고를 등록할 수 없습니다.' : undefined}
            >
              등록
            </Button>
          )}
        </div>
      )}
      {canCreate && isWeekend && (
        <p className="text-sm text-orange-600 text-right mb-3">
          주말(토요일, 일요일)에는 광고를 등록할 수 없습니다.
        </p>
      )}

      <AdTable
        ads={ads}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={(ad) => setEditAd(ad)}
        showCheckbox={canDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AdEditModal
        isOpen={!!editAd}
        onClose={() => setEditAd(null)}
        onSuccess={handleEditSuccess}
        ad={editAd}
        currentRole={currentRole}
      />
    </div>
  );
}
