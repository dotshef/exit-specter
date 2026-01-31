import { ReactNode } from 'react';
import ColumnMessage from './ColumnMessage';

interface HierarchyColumnProps {
  width?: string;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  children?: ReactNode;
}

export default function HierarchyColumn({
  width = 'w-48',
  loading = false,
  loadingMessage = '로딩 중...',
  emptyMessage,
  isEmpty = false,
  children,
}: HierarchyColumnProps) {
  return (
    <div className={`${width} h-full border-r border-gray-200 overflow-y-auto`}>
      {loading ? (
        <ColumnMessage message={loadingMessage} />
      ) : isEmpty && emptyMessage ? (
        <ColumnMessage message={emptyMessage} />
      ) : (
        children
      )}
    </div>
  );
}
