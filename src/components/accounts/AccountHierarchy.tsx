'use client';

import { useState, useEffect } from 'react';
import { Role } from '@/types';

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
}

interface Organization {
  id: number;
  name: string;
  agencies: UserInfo[];
  advertisers: UserInfo[];
}

interface HierarchyData {
  masters?: Master[];
  organizations?: Organization[];
  organization?: Organization & { master?: { id: number; nickname: string | null } };
}

interface AccountHierarchyProps {
  currentRole: Role;
}

export default function AccountHierarchy({ currentRole }: AccountHierarchyProps) {
  const [data, setData] = useState<HierarchyData>({});
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchHierarchy(masterId?: number, orgId?: number) {
    setLoading(true);
    const params = new URLSearchParams();
    if (masterId) params.set('masterId', masterId.toString());
    if (orgId) params.set('organizationId', orgId.toString());

    const res = await fetch(`/api/accounts/hierarchy?${params.toString()}`);
    if (res.ok) {
      const newData = await res.json();
      setData(newData);

      // MASTER가 처음 로드 시 첫 번째 총판 자동 선택
      if (currentRole === 'MASTER' && !masterId && newData.masters?.length > 0) {
        const firstMaster = newData.masters[0];
        setSelectedMasterId(firstMaster.id);
        fetchHierarchy(firstMaster.id);
        return;
      }
    }
    setLoading(false);
  }

  // 초기 데이터 로드
  useEffect(() => {
    fetchHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMasterSelect(masterId: number) {
    setSelectedMasterId(masterId);
    setSelectedOrgId(null);
    fetchHierarchy(masterId);
  }

  function handleOrgSelect(orgId: number) {
    setSelectedOrgId(orgId);
  }

  // 선택된 조직 정보
  const selectedOrg = data.organizations?.find((o) => o.id === selectedOrgId) || data.organization;

  // 계정 테이블 컴포넌트
  function AccountTable({ accounts }: { accounts: UserInfo[] }) {
    if (accounts.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="px-3 py-8 text-center text-gray-400">
            등록된 계정이 없습니다.
          </td>
        </tr>
      );
    }

    return (
      <>
        {accounts.map((account) => (
          <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-3 py-3 text-gray-900">{account.nickname || '-'}</td>
            <td className="px-3 py-3 text-gray-600">{account.username}</td>
            <td className="px-3 py-3 text-gray-500">{account.memo || '-'}</td>
          </tr>
        ))}
      </>
    );
  }

  // AGENCY/ADVERTISER는 바로 organization 데이터 표시
  if (currentRole !== 'MASTER') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-gray-200">
          {/* 총판 탭 */}
          <div className="w-48 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
            총판
          </div>
          {/* 조직 탭 */}
          <div className="w-56 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
            조직
          </div>
          {/* 계정 목록 탭 */}
          <div className="flex-1 py-3 px-4 text-sm font-medium text-center bg-gray-50 text-gray-500">
            계정 목록
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex min-h-[500px]">
          {/* 총판 */}
          <div className="w-48 border-r border-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
            ) : data.organization?.master ? (
              <div className="px-3 py-3 text-sm text-[var(--primary)] font-medium border-b-2 border-[var(--primary)]">
                <div>{data.organization.master.nickname || '총판'}</div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">조직 1</div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">총판 정보 없음</div>
            )}
          </div>

          {/* 조직 */}
          <div className="w-56 border-r border-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
            ) : data.organization ? (
              <div className="px-3 py-3 text-sm text-[var(--primary)] font-medium border-b-2 border-[var(--primary)]">
                <div>{data.organization.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 font-normal">
                  대행사 {data.organization.agencies.length} · 광고주 {data.organization.advertisers.length}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">소속 조직 없음</div>
            )}
          </div>

          {/* 계정 테이블 */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                로딩 중...
              </div>
            ) : data.organization ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-3 text-left font-medium text-gray-600">닉네임</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-600">아이디</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-600">메모</th>
                  </tr>
                </thead>
                <tbody>
                  <AccountTable accounts={[...data.organization.agencies, ...data.organization.advertisers]} />
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
    );
  }

  // MASTER용 UI
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200">
        {/* 총판 탭 */}
        <div className="w-48 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
          총판
        </div>
        {/* 조직 탭 */}
        <div className="w-56 py-3 px-4 text-sm font-medium text-center border-r border-gray-200 bg-gray-50 text-gray-500">
          조직
        </div>
        {/* 계정 목록 탭 */}
        <div className="flex-1 py-3 px-4 text-sm font-medium text-center bg-gray-50 text-gray-500">
          {selectedOrg ? selectedOrg.name : '계정 목록'}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex min-h-[500px]">
        {/* 총판 목록 */}
        <div className="w-48 border-r border-gray-200 overflow-y-auto">
          {loading && !data.masters ? (
            <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
          ) : (
            data.masters?.map((master) => (
              <button
                key={master.id}
                onClick={() => handleMasterSelect(master.id)}
                className={`w-full px-3 py-3 text-left transition-colors cursor-pointer ${
                  selectedMasterId === master.id
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-gray-600 hover:bg-gray-50 border-b border-gray-100'
                }`}
              >
                <div className={`text-sm ${selectedMasterId === master.id ? 'font-medium' : ''}`}>
                  {master.nickname || master.username}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  조직 {master.organizationCount}
                </div>
              </button>
            ))
          )}
        </div>

        {/* 조직 목록 */}
        <div className="w-56 border-r border-gray-200 overflow-y-auto">
          {!selectedMasterId ? (
            <div className="p-4 text-center text-gray-400 text-sm">총판을 선택하세요.</div>
          ) : loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">로딩 중...</div>
          ) : data.organizations?.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">등록된 조직이 없습니다.</div>
          ) : (
            data.organizations?.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrgSelect(org.id)}
                className={`w-full px-3 py-3 text-left transition-colors cursor-pointer ${
                  selectedOrgId === org.id
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-gray-600 hover:bg-gray-50 border-b border-gray-100'
                }`}
              >
                <div className={`text-sm ${selectedOrgId === org.id ? 'font-medium' : ''}`}>{org.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  대행사 {org.agencies.length} · 광고주 {org.advertisers.length}
                </div>
              </button>
            ))
          )}
        </div>

        {/* 계정 테이블 */}
        <div className="flex-1 overflow-x-auto">
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
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-3 text-left font-medium text-gray-600">닉네임</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">아이디</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">메모</th>
                </tr>
              </thead>
              <tbody>
                <AccountTable accounts={[...selectedOrg.agencies, ...selectedOrg.advertisers]} />
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
