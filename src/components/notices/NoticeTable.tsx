'use client';

import { useRouter } from 'next/navigation';
import { Notice } from '@/types';
import { formatDate } from '@/components/util/Date';

interface NoticeTableProps {
  notices: Notice[];
  loading?: boolean;
}

export default function NoticeTable({ notices, loading }: NoticeTableProps) {
  const router = useRouter();

  function handleRowClick(id: number) {
    router.push(`/notices/${id}`);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-16">No</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">제목</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-28">작성자</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">작성일</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-24">조회수</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  로딩중...
                </td>
              </tr>
            ) : notices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              notices.map((notice) => (
                <tr
                  key={notice.id}
                  onClick={() => handleRowClick(notice.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-600">{notice.id}</td>
                  <td className="px-4 py-3 text-gray-900">{notice.title}</td>
                  <td className="px-4 py-3 text-gray-600">{notice.authorNickname || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(notice.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{notice.viewCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
