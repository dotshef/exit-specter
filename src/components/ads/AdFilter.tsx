'use client';

import { useState, useEffect, useCallback } from 'react';
import { Role } from '@/types';
import Dropdown from '@/components/ui/Dropdown';

interface Master {
  id: number;
  username: string;
  nickname: string | null;
}

interface Agency {
  id: number;
  name: string;
}

interface Advertiser {
  id: number;
  username: string;
  nickname: string | null;
}

interface AdFilterProps {
  currentRole: Role;
  onFilterChange: (filter: { masterId: number | null; organizationId: number | null; advertiserId: number | null }) => void;
}

export default function AdFilter({ currentRole, onFilterChange }: AdFilterProps) {
  const [masters, setMasters] = useState<Master[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);

  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState<number | null>(null);

  // 총판 목록 로드 (MASTER만)
  useEffect(() => {
    if (currentRole !== 'MASTER') return;
    fetch('/api/masters')
      .then((res) => res.json())
      .then((data) => setMasters(data.masters || []));
  }, [currentRole]);

  // AGENCY: 자기 org 광고주 목록 로드
  useEffect(() => {
    if (currentRole !== 'AGENCY') return;
    fetch('/api/advertisers')
      .then((res) => res.json())
      .then((data) => setAdvertisers(data.advertisers || []));
  }, [currentRole]);

  // 대행사 목록 로드 (총판 선택 시)
  const fetchAgencies = useCallback(async (masterId: number | null) => {
    if (!masterId) {
      setAgencies([]);
      return;
    }
    const res = await fetch(`/api/agencies?masterId=${masterId}`);
    const data = await res.json();
    setAgencies(data.agencies || []);
  }, []);

  // 광고주 목록 로드 (MASTER용: 총판/대행사 선택에 따라)
  const fetchAdvertisers = useCallback(async (masterId: number | null, orgId: number | null) => {
    if (currentRole !== 'MASTER') return;
    const params = new URLSearchParams();
    if (orgId) {
      params.set('organizationId', orgId.toString());
    } else if (masterId) {
      params.set('masterId', masterId.toString());
    }
    const res = await fetch(`/api/advertisers?${params.toString()}`);
    const data = await res.json();
    setAdvertisers(data.advertisers || []);
  }, [currentRole]);

  function handleMasterChange(masterId: number | null) {
    setSelectedMasterId(masterId);
    setSelectedOrgId(null);
    setSelectedAdvertiserId(null);
    fetchAgencies(masterId);
    fetchAdvertisers(masterId, null);
    onFilterChange({ masterId, organizationId: null, advertiserId: null });
  }

  function handleOrgChange(orgId: number | null) {
    setSelectedOrgId(orgId);
    setSelectedAdvertiserId(null);
    fetchAdvertisers(selectedMasterId, orgId);
    onFilterChange({ masterId: selectedMasterId, organizationId: orgId, advertiserId: null });
  }

  function handleAdvertiserChange(advertiserId: number | null) {
    setSelectedAdvertiserId(advertiserId);
    onFilterChange({ masterId: selectedMasterId, organizationId: selectedOrgId, advertiserId });
  }

  function toVal(id: number | null) { return id?.toString() ?? ''; }
  function toId(val: string) { return val ? Number(val) : null; }

  // ADVERTISER: 필터 UI 숨김
  if (currentRole === 'ADVERTISER') {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex gap-4">
        {/* MASTER: 총판 드롭다운 */}
        {currentRole === 'MASTER' && (
          <div className="flex-1">
            <Dropdown
              label="총판"
              placeholder="전체"
              value={toVal(selectedMasterId)}
              onChange={(v) => handleMasterChange(toId(v))}
              options={masters.map((m) => ({ value: m.id.toString(), label: m.nickname || m.username }))}
            />
          </div>
        )}

        {/* MASTER: 대행사 드롭다운 */}
        {currentRole === 'MASTER' && (
          <div className="flex-1">
            <Dropdown
              label="대행사"
              placeholder="전체"
              value={toVal(selectedOrgId)}
              onChange={(v) => handleOrgChange(toId(v))}
              options={agencies.map((a) => ({ value: a.id.toString(), label: a.name }))}
            />
          </div>
        )}

        {/* MASTER + AGENCY: 광고주 드롭다운 */}
        <div className="flex-1">
          <Dropdown
            label="광고주"
            placeholder="전체"
            value={toVal(selectedAdvertiserId)}
            onChange={(v) => handleAdvertiserChange(toId(v))}
            options={advertisers.map((a) => ({ value: a.id.toString(), label: a.nickname || a.username }))}
          />
        </div>
      </div>
    </div>
  );
}
