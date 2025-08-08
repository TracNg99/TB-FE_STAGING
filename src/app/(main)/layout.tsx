'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';

import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import Navbar from '@/components/layouts/side-navbar';
import { SidebarProvider } from '@/contexts/sidebar-provider';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const transitionKey = useMemo(() => {
    if (!pathname) return 'root';
    // Group stories list and create pages to avoid transition animation between them
    if (pathname === '/stories' || pathname.startsWith('/stories/new')) {
      return '/stories-group';
    }
    return pathname;
  }, [pathname]);

  return (
    <SidebarProvider>
      {/* Mobile Pattern (< 1024px) */}
      <div className="flex relative flex-col md:hidden h-[100dvh]">
        {/* Mobile header - currently handled by MobileNavbar component */}
        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={transitionKey}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: 'easeInOut',
              }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom navigation */}
        <nav className="md:hidden flex-shrink-0">
          <MobileNavbar />
        </nav>
      </div>

      {/* Desktop Pattern (≥ 1024px) */}
      <div className="hidden md:flex md:flex-row h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-20 flex-shrink-0">
          <Navbar />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Desktop header */}
          <header className="hidden md:flex flex-shrink-0">
            {/* Desktop header content can be added here if needed */}
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={transitionKey}
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  ease: 'easeInOut',
                }}
                className="h-full relative"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
