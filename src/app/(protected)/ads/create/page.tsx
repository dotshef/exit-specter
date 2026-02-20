'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { isWeekendKST } from '@/lib/date';
import { Role } from '@/types';

interface Advertiser {
  id: number;
  username: string;
}

interface AdRow {
  keyword: string;
  productLink: string;
  startDate: string;
  endDate: string;
}

function calculateRemainingDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const base = start > today ? start : today;
  const diffTime = end.getTime() - base.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays + 1);
}

function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url);
}

export default function AdCreatePage() {
  const router = useRouter();
  const { addToast } = useToast();

  // 초기 입력창 상태
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [advertiserId, setAdvertiserId] = useState<number | null>(null);
  const [kind, setKind] = useState<'PAID' | 'TEST'>('PAID');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [currentRole, setCurrentRole] = useState<Role>('MASTER');

  // 후기 입력창 상태
  const [showAdRows, setShowAdRows] = useState(false);
  const [adRows, setAdRows] = useState<AdRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isWeekend = isWeekendKST();

  useEffect(() => {
    async function init() {
      // 현재 사용자 정보 조회
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        const role = meData.user.role as Role;
        setCurrentRole(role);

        // ADVERTISER는 접근 불가
        if (role === 'ADVERTISER') {
          router.push('/ads');
          return;
        }
      }

      // 광고주 목록 조회
      const res = await fetch('/api/advertisers');
      const data = await res.json();
      if (data.advertisers) {
        setAdvertisers(data.advertisers);
        if (data.advertisers.length > 0) {
          setAdvertiserId(data.advertisers[0].id);
        }
      }
    }
    init();
  }, [router]);

  function handleApply() {
    if (!advertiserId) {
      setError('광고주를 선택해주세요.');
      return;
    }
    if (!quantity || quantity < 1) {
      setError('수량은 1개 이상이어야 합니다.');
      return;
    }

    setError('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    const endDateStr = defaultEndDate.toISOString().split('T')[0];

    // 수량만큼 row 생성
    const rows: AdRow[] = Array.from({ length: quantity }, () => ({
      keyword: '',
      productLink: '',
      startDate: tomorrowStr,
      endDate: endDateStr,
    }));
    setAdRows(rows);
    setShowAdRows(true);
  }

  function updateAdRow(index: number, field: keyof AdRow, value: string) {
    setAdRows((prev) => {
      const updated = [...prev];
      if (field === 'keyword' && value.length > 10) {
        return prev;
      }
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleSubmit() {
    setError('');

    // Validation
    for (let i = 0; i < adRows.length; i++) {
      const row = adRows[i];
      if (!row.startDate || !row.endDate) {
        setError(`${i + 1}번째 광고의 시작일과 종료일을 입력해주세요.`);
        return;
      }
      if (row.productLink && !isValidUrl(row.productLink)) {
        setError(`${i + 1}번째 광고의 상품 링크는 http:// 또는 https://로 시작해야 합니다.`);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiserId,
          kind,
          ads: adRows.map((row) => ({
            keyword: row.keyword || null,
            productLink: row.productLink || null,
            startDate: row.startDate,
            endDate: row.endDate,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      addToast(`${data.count}개 광고가 등록되었습니다.`, 'success');
      router.push('/ads');
    } catch {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">광고 등록</h1>
        <p className="text-sm text-gray-500 mt-1">
          새로운 광고를 등록합니다. 정보를 입력하고 적용 버튼을 눌러 상세 정보를 입력하세요.
        </p>
      </div>

      {/* 초기 입력창 */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              광고주 아이디<span className="text-red-500">*</span>
            </label>
            {advertisers.length <= 1 ? (
              <input
                type="text"
                value={advertisers[0]?.username || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600"
              />
            ) : (
              <select
                value={advertiserId || ''}
                onChange={(e) => setAdvertiserId(Number(e.target.value))}
                disabled={showAdRows}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100"
              >
                {advertisers.map((a) => (
                  <option key={a.id} value={a.id}>{a.username}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유형<span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                type="button"
                onClick={() => !showAdRows && setKind('PAID')}
                disabled={showAdRows}
                className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  kind === 'PAID'
                    ? 'bg-[#2E3A4A] text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } disabled:cursor-not-allowed`}
              >
                광고
              </button>
              <button
                type="button"
                onClick={() => !showAdRows && setKind('TEST')}
                disabled={showAdRows}
                className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  kind === 'TEST'
                    ? 'bg-[#2E3A4A] text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } disabled:cursor-not-allowed`}
              >
                테스트
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수량<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuantity(val === '' ? '' : Number(val));
                }}
                onBlur={() => {
                  if (quantity === '' || quantity < 1) {
                    setQuantity(1);
                  }
                }}
                disabled={showAdRows}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:bg-gray-100"
              />
              <Button
                onClick={handleApply}
                disabled={showAdRows}
              >
                적용
              </Button>
            </div>
          </div>
        </div>

        {error && !showAdRows && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {/* 후기 입력창 */}
      {showAdRows && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-3 text-left font-medium text-gray-600 w-12">No</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">키워드 (최대 10자)</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600">상품 링크</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600 w-36">시작일</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600 w-36">종료일</th>
                  <th className="px-3 py-3 text-left font-medium text-gray-600 w-28">남은작업일수</th>
                </tr>
              </thead>
              <tbody>
                {adRows.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.keyword}
                        onChange={(e) => updateAdRow(index, 'keyword', e.target.value)}
                        maxLength={10}
                        placeholder="키워드"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="url"
                        value={row.productLink}
                        onChange={(e) => updateAdRow(index, 'productLink', e.target.value)}
                        placeholder="https://"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={row.startDate}
                        onChange={(e) => updateAdRow(index, 'startDate', e.target.value)}
                        min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={row.endDate}
                        onChange={(e) => updateAdRow(index, 'endDate', e.target.value)}
                        min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                      />
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">
                      {calculateRemainingDays(row.startDate, row.endDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <p className="text-sm text-red-600 px-4 py-3">{error}</p>}
          {isWeekend && (
            <p className="text-sm text-orange-600 px-4 py-3">
              주말(토요일, 일요일)에는 광고를 등록할 수 없습니다.
            </p>
          )}

          <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowAdRows(false);
                setAdRows([]);
              }}
            >
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={loading || isWeekend}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </div>
        </div>
      )}

      {/* 돌아가기 버튼 */}
      {!showAdRows && (
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push('/ads')}>
            목록으로
          </Button>
        </div>
      )}
    </div>
  );
}
