import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs animate-pulse">
          <div className="w-full h-48 bg-neutral-200 rounded-xl mb-4" />
          <div className="h-4 bg-neutral-200 rounded-md w-3/4 mb-2" />
          <div className="h-3 bg-neutral-100 rounded-md w-1/2 mb-4" />
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <div className="h-5 bg-neutral-200 rounded-md w-1/3" />
            <div className="h-8 bg-neutral-200 rounded-lg w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse border-b border-neutral-100">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="p-4">
              <div className="h-4 bg-neutral-200 rounded-md w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
