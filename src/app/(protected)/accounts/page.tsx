'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Role, AccountStats } from '@/types';
import StatsCard from '@/components/ui/StatsCard';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import AccountTable from '@/components/accounts/AccountTable';
import AccountCreateModal from '@/components/accounts/AccountCreateModal';
import AccountEditModal from '@/components/accounts/AccountEditModal';
import { useToast } from '@/hooks/useToast';

export default function AccountsPage() {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState<User[]>([]);
  const [stats, setStats] = useState<AccountStats>({ total: 0, master: 0, agency: 0, advertiser: 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedStatIndex, setSelectedStatIndex] = useState<number>(0);
  const [currentRole, setCurrentRole] = useState<Role>('MASTER');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<User | null>(null);

  const roleFilters: (string | null)[] = [null, 'MASTER', 'AGENCY', 'ADVERTISER'];

  const fetchAccounts = useCallback(async (roleFilter?: string | null) => {
    const params = roleFilter ? `?role=${roleFilter}` : '';
    const res = await fetch(`/api/accounts${params}`);
    if (res.ok) {
      const data = await res.json();
      setAccounts(data.accounts);
      if (!roleFilter) {
        setStats(data.stats);
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentRole(data.user.role as Role);
        }
      });
    fetchAccounts();
  }, [fetchAccounts]);

  function handleStatSelect(index: number) {
    setSelectedStatIndex(index);
    setSelectedIds([]);
    const filter = roleFilters[index];
    fetchAccounts(filter);
  }

  async function handleDelete() {
    if (selectedIds.length === 0) {
      addToast('삭제할 계정을 선택해주세요.', 'error');
      return;
    }

    const res = await fetch('/api/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });

    const data = await res.json();

    if (res.ok) {
      addToast(`${data.deletedCount}개 계정이 삭제되었습니다.`, 'success');
      setSelectedIds([]);
      setSelectedStatIndex(0);
      fetchAccounts();
    } else {
      addToast(data.error, 'error');
    }
  }

  function handleCreateSuccess() {
    addToast('계정이 등록되었습니다.', 'success');
    setSelectedStatIndex(0);
    fetchAccounts();
  }

  function handleEditSuccess() {
    addToast('계정이 수정되었습니다.', 'success');
    fetchAccounts(roleFilters[selectedStatIndex]);
  }

  const statsItems = [
    { label: '전체', value: stats.total },
    { label: '총판사', value: stats.master },
    { label: '대행사', value: stats.agency },
    { label: '광고주', value: stats.advertiser },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">계정관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          계정의 정보를 확인하고, 추가·수정·삭제 등의 관리 작업을 할 수 있습니다.
        </p>
      </div>

      <div className="mb-6">
        <StatsCard
          title="계정 현황"
          items={statsItems}
          selectedIndex={selectedStatIndex}
          onSelect={handleStatSelect}
        />
      </div>

      <div className="flex justify-end gap-2 mb-3">
        <Button variant="outline" onClick={handleDelete}>삭제</Button>
        <Button onClick={() => setIsCreateOpen(true)}>등록</Button>
      </div>

      <AccountTable
        accounts={accounts}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={(account) => setEditAccount(account)}
      />

      <Pagination />

      <AccountCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
        currentRole={currentRole}
      />

      <AccountEditModal
        isOpen={!!editAccount}
        onClose={() => setEditAccount(null)}
        onSuccess={handleEditSuccess}
        account={editAccount}
      />
    </div>
  );
}
