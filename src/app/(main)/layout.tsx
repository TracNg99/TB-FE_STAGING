'use client';

import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import MobileNavbar from '@/components/layouts/mobile-nav-layout';
import Navbar from '@/components/layouts/side-navbar';
import { SidebarProvider } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isIOS, setIsIOS] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    console.log('User Agent', navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsIOS(isIOS);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const { height, offsetTop, pageTop } = window.visualViewport;
        const threshold = window.innerHeight * 0.9; // 90% of the initial heigh

        console.log('Viewport offeset TOP: ', offsetTop);
        console.log('Viewport Y Coord TOP: ', pageTop);

        if (height < threshold || offsetTop !== 0 || pageTop !== 0) {
          // document.body.style.overflow = 'hidden';
          // document.body.style.height = '52vh';
          // document.body.style.position = 'fixed';
          console.log('Keyboard Visible');
          setIsKeyboardVisible(true);
        } else {
          console.log('Keyboard Hidden');
          setIsKeyboardVisible(false);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    // return () => {
    //   if (window.visualViewport) {
    //     window.visualViewport.removeEventListener('resize', handleResize);
    //   }
    // };
  }, []);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    if (!isMobile || !isKeyboardVisible || !isIOS) return;
    document.documentElement.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    return () => {
      document.documentElement.removeEventListener(
        'touchmove',
        handleTouchMove,
      );
    };
  }, [isMobile, isKeyboardVisible, isIOS]);

  return (
    <SidebarProvider>
      <div
        className={cn('flex h-screen overflow-hidden', {
          'relative h-[32vh] bg-[#FCFCF9] bottom-0 overscroll-none':
            isMobile && isKeyboardVisible && isIOS,
        })}
      >
        {isMobile ? (
          <MobileNavbar
            isMobile={isMobile}
            isKeyboardVisible={isKeyboardVisible}
          />
        ) : (
          <Navbar />
        )}
        <main
          className={cn('flex-grow overflow-y-auto', {
            'relative h-[32vh] bg-[#FCFCF9] bottom-0 overscroll-none':
              isMobile && isKeyboardVisible && isIOS,
          })}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
