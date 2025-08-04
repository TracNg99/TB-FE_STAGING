'use client';

import React from 'react';

export default function DiscoveriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row h-full w-full bg-gray-50 overflow-hidden">
      {/* Collapsible Sub-sidebar for Discoveries */}
      {/* <aside
        onMouseLeave={() => {
          if (!isPinned) {
            setIsSidebarOpen(false);
          }
        }}
        className={cn(
          'h-full flex-col bg-white z-50 transition-all duration-300 ease-in-out flex overflow-hidden lg:flex flex-shrink-0',
          'hidden', // Hide on mobile by default
          isSidebarOpen || isPinned
            ? 'w-64 border-r border-gray-200'
            : 'w-0 p-0 border-none',
          !isPinned && 'absolute left-0 top-0',
        )}
      >
        <div className="p-4 flex justify-between items-center flex-shrink-0">
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
          {actualAddresses.map((address) => (
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
      </aside> */}

      {/* Main Content Area with proper spacing */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
