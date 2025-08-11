'use client';

import React from 'react';

const StoriesListSkeleton: React.FC = () => {
  return (
    <div className="w-full">
      {/* Desktop header skeleton only (mobile uses actual sticky header from layout) */}
      <div className="hidden md:block py-6 pb-3">
        <div className="h-8 md:h-10 bg-gray-200 rounded w-2/5 animate-pulse" />
        <div className="hidden md:flex gap-3 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-gray-100 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Featured card skeleton (no border, aligned with PageWrapper) */}
      <div className="overflow-hidden mb-6">
        <div className="relative w-full aspect-[16/9] md:aspect-[16/7] bg-gray-200 animate-pulse" />
        <div className="py-6 px-3 flex flex-col gap-2">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
      </div>

      {/* Grid for remaining cards (no borders) */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden">
            <div className="relative w-full aspect-[4/3] bg-gray-200 animate-pulse" />
            <div className="py-4 px-3 flex flex-col gap-2">
              <div className="h-5 bg-gray-200 rounded w-4/5 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesListSkeleton;
