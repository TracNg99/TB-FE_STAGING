'use client';

import { Avatar, Button, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDoorExit, IconUserCircle } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// import Image from 'next/image';
import { BsPersonCircle } from 'react-icons/bs';

import { useAuth } from '@/contexts/auth-provider';
import { useChat } from '@/contexts/chat-provider';
// import { useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

// import AiButton from '../ai-button';

const navbarLinks = [
  {
    title: 'Home',
    href: '/',
    icon: '/assets/home.svg',
    tag: 'home',
  },
  {
    title: 'Discover',
    href: 'discoveries',
    icon: '/assets/discover.svg',
  },
  {
    title: 'Stories',
    href: 'stories',
    icon: '/assets/story.svg',
  },
  {
    title: 'History',
    href: 'history',
    icon: '/assets/history.svg',
  },
];

const Navbar = ({ isMobile }: { isMobile?: boolean }) => {
  const { user, logout } = useAuth();
  const { triggerReset } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  // const params = useParams();
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('/');
      return;
    }

    const currentPath = pathname.substring(1);

    for (const link of navbarLinks) {
      if (link.href !== '/' && currentPath.startsWith(link.href)) {
        setActiveTab(link.href);
      }
    }

    setIsOAuthCallback(pathname === '/auth/callbackv1');
  }, [pathname]);

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href === '/history' && !user && !localStorage.getItem('jwt')) {
      notifications.show({
        title: 'Member-only feature',
        message: 'Please login to use this feature!',
        color: 'yellow',
      });
      router.push('/auth/login');
      return;
    }

    if (href === '/' && pathname === '/') {
      triggerReset();
    }

    router.replace(href === '/' ? href : `/${href}`);
  };

  const handleAiButtonClicked = () => {
    setActiveTab('/stories/new');
    if (!user) {
      notifications.show({
        title: 'Member-only feature',
        message: 'Please login to use this feature!',
        color: 'yellow',
        position: 'top-center',
      });
      router.push('/auth/login');
      return;
    }

    router.push('/stories/new');
  };

  return (
    <>
      {pathname === '/' && isMobile && (
        <div className={cn('fixed top-[2dvh] left-[2dvh] flex flex-row z-10')}>
          {user ? (
            <Popover position="top-end" withArrow>
              <Popover.Target>
                <UnstyledButton
                  onClick={() => handleTabChange('/profile')}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg p-2',
                    activeTab === '/profile' && 'bg-orange-100/50',
                    'bg-transparent rounded-full',
                  )}
                >
                  <div className="bg-transparent text-white rounded-full p-0">
                    <Avatar
                      className="bg-white"
                      src={user.media_assets?.url ?? null}
                      name={user.username}
                      radius="xl"
                    />
                  </div>
                  {/* <span className="text-xs font-medium text-orange-500">
                    Profile
                  </span> */}
                </UnstyledButton>
              </Popover.Target>
              <Popover.Dropdown className="flex flex-col gap-2 bg-white/50">
                <Button
                  className="flex bg-orange-500 text-white"
                  fullWidth
                  variant="subtle"
                  onClick={() => router.push('/profile')}
                >
                  <IconUserCircle className="mr-2" color="white" />
                  Profile
                </Button>
                <Button
                  className="flex bg-red-500 text-white"
                  fullWidth
                  variant="subtle"
                  color="red"
                  onClick={logout}
                >
                  <IconDoorExit className="mr-2" color="white" />
                  Logout
                </Button>
              </Popover.Dropdown>
            </Popover>
          ) : (
            <div
              // href="/auth/login"
              className="flex flex-col items-center gap-1 rounded-full p-4 bg-transparent"
              onClick={logout}
            >
              <BsPersonCircle color="#FB5607" size={32} />
              {/* <span className="text-xs font-medium text-orange-500">Login</span> */}
            </div>
          )}
          <Link
            href="/"
            className="fixed top-[2dvh] left-[50%] translate-x-[-50%] p-1 bg-transparent rounded-xl"
            onClick={triggerReset}
          >
            <Image
              src="/assets/travelbuddy_logo_icon.svg"
              alt="Logo"
              width={56}
              height={56}
            />
          </Link>
        </div>
      )}
      {isMobile && (
        <footer
          className={`
        fixed bottom-0 left-0 right-0 
        z-1000 flex h-16 w-full items-center 
        justify-around border-t border-gray-200 
        bg-white md:hidden
      `}
        >
          {navbarLinks.map((link, index) => (
            <UnstyledButton
              onClick={() =>
                link.title === 'Stories'
                  ? handleAiButtonClicked()
                  : handleTabChange(link.href)
              }
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg p-2 size-[50px]',
                {
                  'flex bg-[#FFF2E5]':
                    activeTab === link.href && !isOAuthCallback,
                },
              )}
              key={index}
              disabled={isOAuthCallback}
            >
              <Image
                className="grayscale"
                src={link.icon}
                alt="Home"
                width={28}
                height={28}
              />
              {/* <span className="text-[10px] font-medium">{link.title}</span> */}
            </UnstyledButton>
          ))}
        </footer>
      )}
    </>
  );
};

export default Navbar;
