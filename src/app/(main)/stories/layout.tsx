'use client';

import React from 'react';

export default function DiscoveriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-row md:h-screen w-full bg-gray-50">
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-3 md:px-8">{children}</div>
      </main>
    </div>
  );
}
