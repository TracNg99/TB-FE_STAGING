'use client';

import { IconPin, IconPinFilled } from '@tabler/icons-react';
import React from 'react';

import { Experience } from '@/store/redux/slices/business/experience';
import { cn } from '@/utils/class';

interface AdminDiscoverySidebarProps {
  contents: {
    title: string;
    items: { address: string; experiences: Experience[] }[];
  }[];
  renderItems: (
    title: string,
    item: { address: string; experiences: Experience[] },
    index: number,
  ) => React.ReactNode;
  isSidebarOpen: boolean;
  isPinned: boolean;
  onSidebarLeave: () => void;
  onTogglePin: () => void;
  className?: string;
  headerActions?: React.ReactNode;
}

interface AdminDiscoverySidebarContentProps {
  index?: string;
  title: string;
  items: { address: string; experiences: Experience[] }[];
  renderItems: (
    title: string,
    item: { address: string; experiences: Experience[] },
    index: number,
  ) => React.ReactNode;
  isPinned: boolean;
  onTogglePin: () => void;
  headerActions?: React.ReactNode;
}

const AdminDiscoverySidebarContent: React.FC<
  AdminDiscoverySidebarContentProps
> = ({
  index,
  title,
  items,
  renderItems,
  isPinned,
  onTogglePin,
  headerActions,
}: AdminDiscoverySidebarContentProps) => {
  const totalExperiencesPerType = Object.entries(items || {}).flat().length;
  return (
    <>
      <div className="h-auto my-3 flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-medium">
          {title} ({totalExperiencesPerType})
        </h2>
        <div className="flex items-center gap-1">
          {index?.includes('0') && (
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
          )}
          {index?.includes('0') && headerActions}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black" />

      {/* Content area provided by consumers */}
      <nav className="py-3 text-base">
        <ul className="px-0 pb-0 space-y-2">
          {items.map((item, index) => renderItems(title, item, index))}
        </ul>
      </nav>
    </>
  );
};

const AdminDiscoverySidebar: React.FC<AdminDiscoverySidebarProps> = ({
  contents,
  renderItems,
  isSidebarOpen,
  isPinned,
  onSidebarLeave,
  onTogglePin,
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
      {contents.map((content, index) => (
        <AdminDiscoverySidebarContent
          key={String(index)}
          index={String(index)}
          title={content.title}
          items={content.items}
          renderItems={renderItems}
          isPinned={isPinned}
          onTogglePin={onTogglePin}
          headerActions={headerActions}
        />
      ))}
    </aside>
  );
};

export default AdminDiscoverySidebar;
