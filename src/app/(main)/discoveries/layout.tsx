'use client';

import { IconPin, IconPinFilled } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import { useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

const ADDRESS_LIST = [
  'For you',
  'Danang',
  'Hanoi',
  'Saigon',
  'Mekong Delta',
  'Phan Thiet',
];

export default function DiscoveriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedAddress = searchParams.get('address') || ADDRESS_LIST[0];

  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isPinned, setIsPinned] = useState(false);

  const handleSelect = (address: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('address', address);
    router.push(`/discoveries?${params.toString()}`);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="relative flex flex-row md:h-screen w-full bg-gray-50">
      {/* Collapsible Sub-sidebar for Discoveries */}
      <aside
        onMouseLeave={() => {
          if (!isPinned) {
            setIsSidebarOpen(false);
          }
        }}
        className={cn(
          ' h-full flex-col bg-white z-50 transition-all duration-300 ease-in-out flex overflow-hidden',
          isSidebarOpen || isPinned
            ? 'w-64 border-r border-gray-200'
            : 'w-0 p-0 border-none',
          !isPinned && 'absolute left-0 top-0',
        )}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Discover</h2>
          <button
            onClick={togglePin}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            {isPinned ? (
              <IconPinFilled className="size-4 text-orange-500" />
            ) : (
              <IconPin className="size-4 text-gray-400" />
            )}
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto space-y-2 px-4 pb-4">
          {ADDRESS_LIST.map((address) => (
            <li key={address}>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${selectedAddress === address ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'}`}
                onClick={() => handleSelect(address)}
              >
                {address}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content Area with proper spacing */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-3 md:px-8">{children}</div>
      </main>
    </div>
  );
}
