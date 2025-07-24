import React from 'react';

import { cn } from '@/utils/class';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({
  children,
  className = '',
}: PageWrapperProps) {
  return (
    <div
      className={cn('w-full px-2 md:px-4 bg-gray-50 min-h-screen', className)}
    >
      <div className={cn('mx-auto max-w-4xl flex flex-col gap-4 pb-12')}>
        {children}
      </div>
    </div>
  );
}
