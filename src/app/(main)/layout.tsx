'use client';

import { useMediaQuery } from '@mantine/hooks';

import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import Navbar from '@/components/layouts/side-navbar';
import { SidebarProvider } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <SidebarProvider>
      <div className={cn('flex h-full overflow-hidden')}>
        {isMobile ? <MobileNavbar isMobile={isMobile} /> : <Navbar />}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            !isMobile && 'ml-24', // Add margin to account for fixed sidebar width
          )}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
