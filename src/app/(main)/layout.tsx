'use client';

import { useMediaQuery } from '@mantine/hooks';

import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import Navbar from '@/components/layouts/side-navbar';
import { SidebarProvider } from '@/contexts/sidebar-provider';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        {isMobile ? <MobileNavbar /> : <Navbar />}
        <main className="flex-grow overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
