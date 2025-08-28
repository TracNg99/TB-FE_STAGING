'use client';

import { useMediaQuery } from '@mantine/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// import { LanguageSwitcher } from '@/components/language-switcher';
import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import Navbar from '@/components/layouts/side-navbar';
import { SidebarProvider } from '@/contexts/sidebar-provider';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isAnimating, setIsAnimating] = useState(false);

  // const transitionKey = useMemo(() => {
  //   setIsAnimating(true);
  //   setTimeout(() => {
  //     setIsAnimating(false);
  //   }, 200);
  //   if (!pathname) return 'root';
  //   // Group stories list and create pages to avoid transition animation between them
  //   if (pathname.startsWith('/stories')) {
  //     return '/stories-group';
  //   }

  //   return pathname;
  // }, [pathname]);

  useEffect(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [pathname]);

  return (
    <SidebarProvider>
      {/* Mobile Pattern (< 1024px) */}
      {isMobile && (
        <div className="flex relative flex-col md:hidden lg:hidden h-[100dvh]">
          {/* Mobile header - currently handled by MobileNavbar component */}
          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key="mobile-content"
                initial={false}
                animate={{
                  opacity: isAnimating ? 0.5 : 1,
                  y: isAnimating ? -10 : 0,
                }}
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
      )}

      {/* Desktop Pattern (≥ 1024px) */}
      {!isMobile && (
        <div className="hidden md:flex md:flex-row h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex w-20 flex-shrink-0">
            <Navbar />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Desktop header */}

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key="desktop-content"
                  initial={false}
                  animate={{
                    opacity: isAnimating ? 0 : 1,
                    y: isAnimating ? 10 : 0,
                  }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeInOut',
                  }}
                  className="h-full relative"
                >
                  {/* <div
                  className={cn(
                    `hidden md:flex flex-shrink-0 justify-end items-center p-2 transition-all duration-300`,
                    {
                      'absolute z-2000 top-0 right-[2dvw] bg-transparent border-transparent backdrop-blur-sm':
                        isHomePage,
                      'border-b border-gray-200 bg-white': !isHomePage,
                    },
                  )}
                >
                  <LanguageSwitcher variant="compact" size="sm" />
                </div> */}
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
};

export default MainLayout;
