'use client';

import { useMediaQuery } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import Navbar from '@/components/layouts/side-navbar';
import { SidebarProvider } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className={cn('flex h-full')}>
        {isMobile ? <MobileNavbar isMobile={isMobile} /> : <Navbar />}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            !isMobile && 'ml-24', // Add margin to account for fixed sidebar width
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
