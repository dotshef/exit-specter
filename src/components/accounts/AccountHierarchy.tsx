'use client';

import { useState, useEffect } from 'react';
import { Role } from '@/types';
import Button from '@/components/ui/Button';
import AccountCreateModal from './AccountCreateModal';
import AccountEditModal from './AccountEditModal';
import ColumnHeader from './hierarchy/ColumnHeader';
import HierarchyColumn from './hierarchy/HierarchyColumn';
import SelectableItem from './hierarchy/SelectableItem';
import ItemContent from './hierarchy/ItemContent';
import GearIcon from '@/components/ui/GearIcon';

interface Master {
  id: number;
  username: string;
  nickname: string | null;
  organizationCount: number;
}

interface UserInfo {
  id: number;
  nickname: string | null;
  username: string;
  memo: string | null;
  role: string;
}

interface Agency {
  id: number;
  name: string;
  masterId: number | null;
  masterNickname: string | null;
  userCount: number;
  agencyUsers: UserInfo[];
  advertisers: UserInfo[];
}

interface HierarchyData {
  masters: Master[];
  agencies: Agency[];
}

interface AccountHierarchyProps {
  currentRole: Role;
}

// 역할 표시 컴포넌트
function RoleBadge({ role }: { role: string }) {
  if (role === 'AGENCY') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        대행사
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
      광고주
    </span>
  );
}

export default function AccountHierarchy({ currentRole }: AccountHierarchyProps) {
  const [data, setData] = useState<HierarchyData>({ masters: [], agencies: [] });
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editAccountId, setEditAccountId] = useState<number | null>(null);

  // MASTER: 초기 로드 - 총판 목록
  async function fetchMasters() {
    const res = await fetch('/api/masters');
    if (res.ok) {
      const json = await res.json();
      return json.masters as Master[];
    }
    return [];
  }

  // MASTER: 총판 선택 시 조직 목록
  async function fetchAgencies(masterId: number) {
    const res = await fetch(`/api/agencies?masterId=${masterId}`);
    if (res.ok) {
      const json = await res.json();
      return json.agencies as Agency[];
    }
    return [];
  }

  // AGENCY/ADVERTISER: 자기 org 데이터 로드
  async function fetchOwnData() {
    const [mastersRes, agenciesRes] = await Promise.all([
      fetch('/api/masters'),
      fetch('/api/agencies'),
    ]);

    const masters = mastersRes.ok ? (await mastersRes.json()).masters : [];
    const agencies = agenciesRes.ok ? (await agenciesRes.json()).agencies : [];

    return { masters, agencies };
  }

  // 초기 데이터 로드
  useEffect(() => {
    async function init() {
      setLoading(true);
      if (currentRole === 'MASTER') {
        const masters = await fetchMasters();
        if (masters.length > 0) {
          const firstMaster = masters[0];
          setSelectedMasterId(firstMaster.id);
          const agencies = await fetchAgencies(firstMaster.id);
          setData({ masters, agencies });
        } else {
          setData({ masters, agencies: [] });
        }
      } else {
        const { masters, agencies } = await fetchOwnData();
        setData({ masters, agencies });
      }
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMasterSelect(masterId: number) {
    setSelectedMasterId(masterId);
    setSelectedOrgId(null);
    setLoading(true);
    const agencies = await fetchAgencies(masterId);
    setData((prev) => ({ ...prev, agencies }));
    setLoading(false);
  }

  function handleOrgSelect(orgId: number) {
    setSelectedOrgId(orgId);
  }

  async function handleCreateSuccess() {
    setLoading(true);
    if (currentRole === 'MASTER') {
      const masters = await fetchMasters();
      const agencies = selectedMasterId ? await fetchAgencies(selectedMasterId) : [];
      setData({ masters, agencies });
    } else {
      const { masters, agencies } = await fetchOwnData();
      setData({ masters, agencies });
    }
    setLoading(false);
  }

  async function handleEditSuccess() {
    setLoading(true);
    if (currentRole === 'MASTER') {
      const masters = await fetchMasters();
      const agencies = selectedMasterId ? await fetchAgencies(selectedMasterId) : [];
      setData({ masters, agencies });
    } else {
      const { masters, agencies } = await fetchOwnData();
      setData({ masters, agencies });
    }
    setLoading(false);
  }

  // 선택된 조직 정보
  const selectedOrg = data.agencies.find((o) => o.id === selectedOrgId);

  // 등록 버튼 표시 여부 (광고주는 숨김)
  const canCreate = currentRole !== 'ADVERTISER';

  // 계정 테이블 컴포넌트
  function AccountTable({ accounts, showActions }: { accounts: UserInfo[]; showActions: boolean }) {
    if (accounts.length === 0) {
      return (
        <tr>
          <td colSpan={showActions ? 5 : 4} className="px-3 py-8 text-center text-gray-400">
            등록된 계정이 없습니다.
          </td>
        </tr>
      );
    }

    return (
      <>
        {accounts.map((account) => (
          <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-3 py-3">
              <RoleBadge role={account.role} />
            </td>
            <td className="px-3 py-3 text-gray-900">{account.nickname || '-'}</td>
            <td className="px-3 py-3 text-gray-600">{account.username}</td>
            <td className="px-3 py-3 text-gray-500">{account.memo || '-'}</td>
            {showActions && (
              <td className="px-3 py-3 text-center">
                <button
                  onClick={() => setEditAccountId(account.id)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <GearIcon />
                </button>
              </td>
            )}
          </tr>
        ))}
      </>
    );
  }

  // 테이블 헤더 렌더링
  function TableHeader({ showActions }: { showActions: boolean }) {
    return (
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className="px-3 py-3 text-left font-medium text-gray-600">역할</th>
          <th className="px-3 py-3 text-left font-medium text-gray-600">닉네임</th>
          <th className="px-3 py-3 text-left font-medium text-gray-600">아이디</th>
          <th className="px-3 py-3 text-left font-medium text-gray-600">메모</th>
          {showActions && (
            <th className="w-14 px-3 py-3 text-center font-medium text-gray-600">관리</th>
          )}
        </tr>
      </thead>
    );
  }

  // 공통 탭 헤더
  function TabHeaders() {
    return (
      <div className="flex border-b border-gray-200">
        <ColumnHeader title="총판" width="w-48" />
        <ColumnHeader title="대행사" width="w-56" />
        <ColumnHeader title="계정 목록" width="flex-1" isLast />
      </div>
    );
  }

  // AGENCY/ADVERTISER는 바로 organization 데이터 표시
  if (currentRole !== 'MASTER') {
    const showActions = currentRole === 'AGENCY';
    const org = data.agencies[0];
    const master = data.masters[0];

    return (
      <>
        {canCreate && (
          <div className="flex justify-end mb-3">
            <Button onClick={() => setIsCreateModalOpen(true)}>등록</Button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <TabHeaders />

          <div className="flex h-[500px]">
            {/* 총판 */}
            <HierarchyColumn
              width="w-48"
              loading={loading}
              isEmpty={!master}
              emptyMessage="총판 정보 없음"
            >
              {master && (
                <div className="px-3 py-3 min-h-[52px] text-sm text-[var(--primary)] font-medium border-b-2 border-[var(--primary)]">
                  <ItemContent
                    title={master.nickname || '총판'}
                    isSelected
                    hideSubtitle
                  />
                </div>
              )}
            </HierarchyColumn>

            {/* 조직 */}
            <HierarchyColumn
              width="w-56"
              loading={loading}
              isEmpty={!org}
              emptyMessage="소속 조직 없음"
            >
              {org && (
                <div className="px-3 py-3 min-h-[52px] text-sm text-[var(--primary)] font-medium border-b-2 border-[var(--primary)]">
                  <ItemContent
                    title={org.name}
                    subtitle={
                      currentRole === 'AGENCY'
                        ? `대행사 ${org.agencyUsers.length} · 광고주 ${org.advertisers.length}`
                        : undefined
                    }
                    isSelected
                    hideSubtitle={currentRole !== 'AGENCY'}
                  />
                </div>
              )}
            </HierarchyColumn>

            {/* 계정 테이블 */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  로딩 중...
                </div>
              ) : org ? (
                <table className="w-full text-sm">
                  <TableHeader showActions={showActions} />
                  <tbody>
                    <AccountTable
                      accounts={[...org.agencyUsers, ...org.advertisers]}
                      showActions={showActions}
                    />
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  소속 조직이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <AccountCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
          currentRole={currentRole}
        />
        <AccountEditModal
          isOpen={editAccountId !== null}
          onClose={() => setEditAccountId(null)}
          onSuccess={handleEditSuccess}
          accountId={editAccountId}
          currentRole={currentRole}
        />
      </>
    );
  }

  // MASTER용 UI
  return (
    <>
      <div className="flex justify-end mb-3">
        <Button onClick={() => setIsCreateModalOpen(true)}>등록</Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <TabHeaders />

        <div className="flex h-[500px]">
          {/* 총판 목록 */}
          <HierarchyColumn
            width="w-48"
            loading={loading && data.masters.length === 0}
          >
            {data.masters.map((master) => (
              <SelectableItem
                key={master.id}
                isSelected={selectedMasterId === master.id}
                onClick={() => handleMasterSelect(master.id)}
                actions={
                  <button
                    onClick={() => setEditAccountId(master.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <GearIcon />
                  </button>
                }
              >
                <ItemContent
                  title={master.nickname || master.username}
                  subtitle={`조직 ${master.organizationCount}`}
                  isSelected={selectedMasterId === master.id}
                />
              </SelectableItem>
            ))}
          </HierarchyColumn>

          {/* 조직 목록 */}
          <HierarchyColumn
            width="w-56"
            loading={loading}
            isEmpty={!selectedMasterId || data.agencies.length === 0}
            emptyMessage={!selectedMasterId ? '총판을 선택하세요.' : '등록된 대행사 조직이 없습니다.'}
          >
            {data.agencies.map((org) => (
              <SelectableItem
                key={org.id}
                isSelected={selectedOrgId === org.id}
                onClick={() => handleOrgSelect(org.id)}
              >
                <ItemContent
                  title={org.name}
                  subtitle={`대행사 ${org.agencyUsers.length} · 광고주 ${org.advertisers.length}`}
                  isSelected={selectedOrgId === org.id}
                />
              </SelectableItem>
            ))}
          </HierarchyColumn>

          {/* 계정 테이블 */}
          <div className="flex-1 overflow-auto">
            {!selectedOrgId ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                조직을 선택하세요.
              </div>
            ) : !selectedOrg ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                로딩 중...
              </div>
            ) : (
              <table className="w-full text-sm">
                <TableHeader showActions />
                <tbody>
                  <AccountTable
                    accounts={[...selectedOrg.agencyUsers, ...selectedOrg.advertisers]}
                    showActions
                  />
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AccountCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        currentRole={currentRole}
      />
      <AccountEditModal
        isOpen={editAccountId !== null}
        onClose={() => setEditAccountId(null)}
        onSuccess={handleEditSuccess}
        accountId={editAccountId}
        currentRole={currentRole}
      />
    </>
  );
}
