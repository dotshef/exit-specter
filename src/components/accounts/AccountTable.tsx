'use client';

import { User } from '@/types';

interface AccountTableProps {
  accounts: User[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (account: User) => void;
}

const ROLE_STYLES: Record<string, string> = {
  MASTER: 'text-gray-900 font-medium',
  AGENCY: 'text-blue-600 font-medium',
  ADVERTISER: 'text-green-600 font-medium',
};

const ROLE_LABELS: Record<string, string> = {
  MASTER: '총판사',
  AGENCY: '대행사',
  ADVERTISER: '광고주',
};

export default function AccountTable({ accounts, selectedIds, onSelectionChange, onEdit }: AccountTableProps) {
  const allSelected = accounts.length > 0 && selectedIds.length === accounts.length;

  function handleSelectAll() {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(accounts.map((a) => a.id));
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
              <th className="px-3 py-3 text-left font-medium text-gray-600">권한</th>
              <th className="px-3 py-3 text-center font-medium text-gray-600">광고</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[200px]">메모</th>
              <th className="w-14 px-3 py-3 text-center font-medium text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  등록된 계정이 없습니다.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(account.id)}
                      onChange={() => handleSelectOne(account.id)}
                      className="rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3 text-gray-600">{account.id}</td>
                  <td className="px-3 py-3 text-gray-900">{account.username}</td>
                  <td className="px-3 py-3">
                    <span className={ROLE_STYLES[account.role] || ''}>
                      {ROLE_LABELS[account.role] || account.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {account.adCount !== undefined && account.adCount > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]">{account.memo || ''}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => onEdit(account)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
