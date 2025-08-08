'use client';

import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import SubSidebar from '@/components/layouts/SubSidebar';
import { cn } from '@/utils/class';

interface StoriesSidebarProps {
  isSidebarOpen: boolean;
  isPinned: boolean;
  onSidebarLeave: () => void;
  onTogglePin: () => void;
}

const StoriesSidebar: React.FC<StoriesSidebarProps> = ({
  isSidebarOpen,
  isPinned,
  onSidebarLeave,
  onTogglePin,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleCreateStory = () => {
    router.push('/stories/new');
  };

  const handleShowMyStories = () => {
    router.push('/stories');
  };

  return (
    <SubSidebar
      title="Stories"
      isSidebarOpen={isSidebarOpen}
      isPinned={isPinned}
      onSidebarLeave={onSidebarLeave}
      onTogglePin={onTogglePin}
    >
      <button
        onClick={handleCreateStory}
        className={cn(
          'w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors',
          pathname?.startsWith('/stories/new') && 'bg-[#FFF2E5] text-black',
        )}
      >
        Create a story
      </button>

      <button
        onClick={handleShowMyStories}
        className={cn(
          'mt-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors',
          pathname === '/stories' && 'bg-[#FFF2E5] text-black',
        )}
      >
        My stories
      </button>
    </SubSidebar>
  );
};

export default StoriesSidebar;
