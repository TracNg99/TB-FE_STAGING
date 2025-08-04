'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import Navbar from '@/components/layouts/side-navbar';
import { SidebarProvider } from '@/contexts/sidebar-provider';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      {/* Mobile Pattern (< 1024px) */}
      <div className="flex relative flex-col lg:hidden h-[100dvh] overflow-hidden">
        {/* Mobile header - currently handled by MobileNavbar component */}
        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
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
        <nav className="lg:hidden flex-shrink-0">
          <MobileNavbar />
        </nav>
      </div>

      {/* Desktop Pattern (≥ 1024px) */}
      <div className="hidden lg:flex lg:flex-row h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-20 flex-shrink-0">
          <Navbar />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Desktop header */}
          <header className="hidden lg:flex flex-shrink-0">
            {/* Desktop header content can be added here if needed */}
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
