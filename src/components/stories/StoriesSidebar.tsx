'use client';

import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import SubSidebar from '@/components/layouts/SubSidebar';
import Translation from '@/components/translation';
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

  const handleShowmyTravelStories = () => {
    router.push('/stories');
  };

  return (
    <Translation>
      {(t) => (
        <SubSidebar
          title={t('stories.sidebar.title')}
          isSidebarOpen={isSidebarOpen}
          isPinned={isPinned}
          onSidebarLeave={onSidebarLeave}
          onTogglePin={onTogglePin}
        >
          <button
            onClick={handleCreateStory}
            className={cn(
              'w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors',
              pathname?.startsWith('/stories/new') && 'bg-[#FFEEE6] text-black',
            )}
          >
            {t('stories.sidebar.newStory')}
          </button>

          <button
            onClick={handleShowmyTravelStories}
            className={cn(
              'mt-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors',
              pathname === '/stories' && 'bg-[#FFEEE6] text-black',
            )}
          >
            {t('stories.sidebar.myStories')}
          </button>
        </SubSidebar>
      )}
    </Translation>
  );
};

export default StoriesSidebar;
