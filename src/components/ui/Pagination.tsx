'use client';

export default function Pagination() {
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
        &laquo;
      </button>
      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
        &lsaquo;
      </button>
      <button className="w-8 h-8 flex items-center justify-center bg-[#2E3A4A] text-white rounded text-sm font-medium">
        1
      </button>
      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
        &rsaquo;
      </button>
      <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
        &raquo;
      </button>
    </div>
  );
}
