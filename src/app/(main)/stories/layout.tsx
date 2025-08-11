'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import PageWrapper from '@/components/layouts/PageWrapper';
import StoriesSidebar from '@/components/stories/StoriesSidebar';
import { useSidebar } from '@/contexts/sidebar-provider';

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isPinned, setIsPinned] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Show mobile tabs only on /stories and /stories/new
  const showMobileTabs = useMemo(() => {
    if (!pathname) return false;
    return pathname === '/stories' || pathname.startsWith('/stories/new');
  }, [pathname]);

  const handleSidebarLeave = () => {
    if (!isPinned) {
      setIsSidebarOpen(false);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="flex flex-row h-full w-full bg-gray-50">
      {/* Collapsible Sub-sidebar for Stories */}
      <StoriesSidebar
        isSidebarOpen={isSidebarOpen}
        isPinned={isPinned}
        onSidebarLeave={handleSidebarLeave}
        onTogglePin={togglePin}
      />

      {/* Main Content Area with proper spacing */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile only sticky header with title and tabs */}
        {showMobileTabs && (
          <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur px-4 py-3 border-b border-gray-200">
            <h1 className="text-[32px] font-semibold mb-2">
              Tell Your Travel Tale
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.replace('/stories/new')}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${pathname.startsWith('/stories/new') ? 'bg-orange-50 text-black border-orange-300' : 'bg-transparent text-gray-700 border-gray-200'}`}
              >
                Create a story
              </button>
              <button
                onClick={() => router.replace('/stories')}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${pathname === '/stories' ? 'bg-orange-50 text-black border-orange-300' : 'bg-transparent text-gray-700 border-gray-200'}`}
              >
                My stories
              </button>
            </div>
          </div>
        )}

        <PageWrapper>{children}</PageWrapper>
      </main>
    </div>
  );
}
