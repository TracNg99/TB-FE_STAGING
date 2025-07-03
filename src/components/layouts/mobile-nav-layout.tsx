'use client';

import { Avatar, Button, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDoorExit, IconUserCircle } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// import Image from 'next/image';
import { BiCompass } from 'react-icons/bi';
import { BsPersonCircle } from 'react-icons/bs';
import { GrDocumentText } from 'react-icons/gr';
// import { IoMdSearch } from 'react-icons/io';
import { GrHistory } from 'react-icons/gr';

import { useAuth } from '@/contexts/auth-provider';
// import { useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

// import AiButton from '../ai-button';

const navbarLinks = [
  {
    title: 'Discover',
    href: '/',
    icon: <BiCompass size={24} />,
  },
  // {
  //   title: 'Experiences',
  //   href: '/discoveries',
  //   icon: <IoMdSearch size={24}/>,
  // },
  {
    title: 'Stories',
    // href: '/stories/new',
    icon: <GrDocumentText size={24} />,
  },
  {
    title: 'History',
    href: '/history',
    icon: <GrHistory size={24} />,
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  //   const { setIsSidebarOpen } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    setIsOAuthCallback(pathname === '/auth/callbackv1');
  }, [pathname]);

  const handleAiButtonClicked = () => {
    if (!user) {
      notifications.show({
        title: 'Member-only feature',
        message: 'Please login to use this feature!',
        color: 'yellow',
      });
      router.push('/auth/login');
      return;
    }

    router.push('/stories/new');
  };

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
    router.replace(href);
  };

  return (
    <>
      {pathname === '/' && (
        <div className="fixed top-[2dvh] left-[2dvh] flex flex-row z-5">
          {user ? (
            <Popover position="top-end" withArrow>
              <Popover.Target>
                <UnstyledButton
                  onClick={() => handleTabChange('/profile')}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg p-2',
                    activeTab === '/profile' && 'bg-orange-100/50',
                    'bg-white/50 rounded-full',
                  )}
                >
                  <div className="bg-orange-500 text-white rounded-full p-2">
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
            <Link
              href="/auth/login"
              className="flex flex-col items-center gap-1 rounded-full p-2 bg-white/50"
            >
              <BsPersonCircle color="#FB5607" size={24} />
              <span className="text-xs font-medium text-orange-500">Login</span>
            </Link>
          )}
          <Link
            href="/"
            className="fixed top-[2dvh] left-[50%] translate-x-[-50%] p-1 bg-white/50 rounded-xl"
          >
            <Image
              src="/assets/travelbuddy_logo_icon.svg"
              alt="Logo"
              width={40}
              height={40}
            />
          </Link>
        </div>
      )}
      <footer
        className={`
        fixed bottom-0 left-0 right-0 
        z-10 flex h-16 w-full items-center 
        justify-around border-t border-gray-200 
        bg-white md:hidden
      `}
      >
        {navbarLinks.map((link, index) => (
          <UnstyledButton
            onClick={() =>
              link.title === 'Stories'
                ? handleAiButtonClicked()
                : handleTabChange(link.href ?? '/')
            }
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg p-2',
              activeTab === link.href && !isOAuthCallback && 'bg-orange-100/50',
            )}
            key={index}
            disabled={isOAuthCallback}
          >
            {link.icon}
            <span className="text-xs font-medium">{link.title}</span>
          </UnstyledButton>
        ))}
      </footer>
    </>
  );
};

export default Navbar;
