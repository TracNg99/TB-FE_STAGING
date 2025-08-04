import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`h-full w-full bg-gray-50 container mx-auto px-4 ${className}`}
    >
      <div className="h-full w-full grid grid-cols-12 gap-x-6">
        {/* Left spacing - hidden on mobile, 1 column on desktop */}
        <div className="hidden md:block md:col-span-1"></div>

        {/* Main content - full width on mobile, 10 columns on desktop */}
        <main className="col-span-12 md:col-span-10 lg:col-span-10">
          <div className="flex flex-col h-full max-w-2xl mx-auto gap-6">
            {children}
          </div>
        </main>

        {/* Right spacing - hidden on mobile, 1 column on desktop */}
        <div className="hidden md:block md:col-span-1"></div>
      </div>
    </div>
  );
};

export default PageWrapper;
