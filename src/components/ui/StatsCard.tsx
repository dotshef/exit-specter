'use client';

interface StatsItem {
  label: string;
  value: number;
}

interface StatsCardProps {
  title: string;
  items: StatsItem[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function StatsCard({ title, items, selectedIndex, onSelect }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex divide-x divide-gray-100">
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={item.label}
              onClick={() => onSelect(index)}
              className="flex-1 py-5 flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span
                className={`text-2xl font-bold ${
                  isSelected ? 'text-blue-500' : 'text-gray-900'
                }`}
              >
                {item.value}
              </span>
              <span
                className={`text-xs ${
                  isSelected ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
