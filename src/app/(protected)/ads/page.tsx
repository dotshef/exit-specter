'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ad, Role, AdStatsGroup } from '@/types';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import AdStatusCards from '@/components/ads/AdStatusCards';
import AdTable from '@/components/ads/AdTable';
import AdCreateModal from '@/components/ads/AdCreateModal';
import AdEditModal from '@/components/ads/AdEditModal';
import { useToast } from '@/hooks/useToast';

const emptyStats: AdStatsGroup = {
  all: { total: 0, active: 0, error: 0, waiting: 0, endingSoon: 0, ended: 0 },
  paid: { total: 0, active: 0, error: 0, waiting: 0, endingSoon: 0, ended: 0 },
  test: { total: 0, active: 0, error: 0, waiting: 0, endingSoon: 0, ended: 0 },
};

export default function AdsPage() {
  const { addToast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdStatsGroup>(emptyStats);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<{ kind: string | null; status: string | null } | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('ADVERTISER');
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editAd, setEditAd] = useState<Ad | null>(null);

  const fetchAds = useCallback(async (filter?: { kind: string | null; status: string | null } | null) => {
    const params = new URLSearchParams();
    if (filter?.status) params.set('status', filter.status);
    if (filter?.kind) params.set('kind', filter.kind);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`/api/ads${query}`);
    if (res.ok) {
      const data = await res.json();
      setAds(data.ads);
      setStats(data.stats);
    }
  }, []);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentRole(data.user.role as Role);
          setOrganizationId(data.user.organizationId);
        }
      });
    fetchAds();
  }, [fetchAds]);

  function handleFilterChange(filter: { kind: string | null; status: string | null } | null) {
    setSelectedFilter(filter);
    setSelectedIds([]);
    fetchAds(filter);
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
      fetchAds();
    } else {
      addToast(data.error, 'error');
    }
  }

  function handleCreateSuccess() {
    addToast('광고가 등록되었습니다.', 'success');
    setSelectedFilter(null);
    fetchAds();
  }

  function handleEditSuccess() {
    addToast('광고가 수정되었습니다.', 'success');
    fetchAds(selectedFilter);
  }

  const canManage = currentRole === 'MASTER' || currentRole === 'AGENCY';

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

      {canManage && (
        <div className="flex justify-end gap-2 mb-3">
          <Button variant="outline" onClick={handleDelete}>삭제</Button>
          <Button onClick={() => setIsCreateOpen(true)}>등록</Button>
        </div>
      )}

      <AdTable
        ads={ads}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={(ad) => setEditAd(ad)}
        showManage={canManage}
      />

      <Pagination />

      {canManage && (
        <>
          <AdCreateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={handleCreateSuccess}
            currentRole={currentRole}
            organizationId={organizationId}
          />

          <AdEditModal
            isOpen={!!editAd}
            onClose={() => setEditAd(null)}
            onSuccess={handleEditSuccess}
            ad={editAd}
            currentRole={currentRole}
          />
        </>
      )}
    </div>
  );
}
