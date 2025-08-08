'use client';

import { IconPin, IconPinFilled } from '@tabler/icons-react';
import React from 'react';

import { cn } from '@/utils/class';

interface SubSidebarProps {
  title: string;
  isSidebarOpen: boolean;
  isPinned: boolean;
  onSidebarLeave: () => void;
  onTogglePin: () => void;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

const SubSidebar: React.FC<SubSidebarProps> = ({
  title,
  isSidebarOpen,
  isPinned,
  onSidebarLeave,
  onTogglePin,
  children,
  className,
  headerActions,
}) => {
  return (
    <aside
      onMouseLeave={onSidebarLeave}
      className={cn(
        'h-full flex-col bg-white z-50 py-6 px-6 transition-all duration-300 ease-in-out flex overflow-hidden lg:flex flex-shrink-0',
        'hidden',
        isSidebarOpen || isPinned
          ? 'w-64 border-r border-gray-200'
          : 'w-0 p-0 border-none',
        !isPinned && 'absolute left-0 top-0',
        className,
      )}
    >
      <div className="h-auto my-3 flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-medium">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            {isPinned ? (
              <IconPinFilled className="size-4 text-orange-500" />
            ) : (
              <IconPin className="size-4 text-gray-400" />
            )}
          </button>
          {headerActions}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black" />

      {/* Content area provided by consumers */}
      <nav className="py-3 text-base">{children}</nav>
    </aside>
  );
};

export default SubSidebar;
