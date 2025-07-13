'use client';

import { Avatar, Button, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Image from 'next/image';
// import { CgHomeAlt as HomeIcon } from "react-icons/cg";
// import { IoSearch as DiscoverIcon } from "react-icons/io5";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { useChat } from '@/contexts/chat-provider';
import { useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

import IconDiscover from '../../../public/assets/discover.svg';
import IconHome from '../../../public/assets/home.svg';
import IconStory from '../../../public/assets/story.svg';
import AiButton from '../ai-button';
import IconHandler from '../icons/icon-handler';

const navbarLinks = [
  {
    title: 'Home',
    href: '/',
    // icon: '/assets/home.svg',
    icon: IconHome,
  },
  {
    title: 'Discover',
    href: 'discoveries',
    // icon: '/assets/discover.svg',
    icon: IconDiscover,
  },
  // {
  //   title: 'Experiences',
  //   href: '/experiences/8efd1b59-fc69-4290-8bf3-20f39dff72e6',
  //   icon: '/assets/backpack.svg',
  // },
  {
    title: 'Stories',
    href: 'stories',
    icon: IconStory,
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setIsSidebarOpen } = useSidebar();
  const { triggerReset } = useChat();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState('/');

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
    if (!user) {
      notifications.show({
        title: 'Member-only feature',
        message: 'Please login to use this feature!',
        color: 'yellow',
      });
      router.push('/auth/login');
      return;
    }
    setActiveTab('/stories/new');
    router.push('/stories/new');
  };

  return (
    <aside
      onMouseEnter={() => setIsSidebarOpen(true)}
      // onMouseLeave={() => setIsSidebarOpen(false)}
      className="fixed left-0 top-0 h-screen w-24 flex flex-col items-center border-r border-gray-200 bg-white py-4 z-10"
    >
      <Link href="/" onClick={triggerReset}>
        <Image
          src="/assets/travelbuddy_logo_icon.svg"
          alt="Logo"
          width={56}
          height={56}
        />
      </Link>
      <nav className="mt-10 flex flex-grow flex-col items-center gap-4">
        {navbarLinks.map((link, index) => (
          <UnstyledButton
            onClick={() =>
              link.title === 'Stories'
                ? handleAiButtonClicked()
                : handleTabChange(link.href ?? '/')
            }
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg p-2',
              activeTab === link.href && 'bg-[#FFF2E5]',
              activeTab !== link.href && 'bg-transparent text-gray-500',
            )}
            key={index}
          >
            {link.title !== 'Stories' && (
              // <Image
              //   src={link.icon}
              //   alt={link.title}
              //   width={32}
              //   height={32}
              //   className={cn(
              //     activeTab === link.href && 'text-black',
              //     activeTab !== link.href && 'text-red-500',
              //     'size-[32px]',
              //   )}
              // />
              <IconHandler
                IconComponent={link.icon}
                className={cn('size-[30px]')}
              />
            )}
            {link.title === 'Stories' && (
              <div
                className={cn(
                  activeTab === '/stories/new' && 'bg-[#FFF2E5]',
                  'grayscale',
                )}
              >
                <AiButton
                  className="flex cursor-pointer"
                  altIcon={
                    <IconHandler
                      IconComponent={link.icon}
                      className={cn('text-[48px]')}
                    />
                  }
                />
              </div>
            )}
            <span className="text-xs font-medium">{link.title}</span>
          </UnstyledButton>
        ))}
      </nav>
      <div className="mt-auto">
        {user ? (
          <Popover position="top" withArrow>
            <Popover.Target>
              <UnstyledButton>
                <Avatar
                  src={user.media_assets?.url ?? null}
                  name={user.username}
                  radius="xl"
                />
              </UnstyledButton>
            </Popover.Target>
            <Popover.Dropdown className="flex flex-col gap-2 bg-white/50">
              <Button
                className="bg-orange-500 text-white"
                fullWidth
                variant="subtle"
                onClick={() => router.push('/profile')}
              >
                Profile
              </Button>
              <Button
                className="bg-red-500 text-white"
                fullWidth
                variant="subtle"
                color="red"
                onClick={logout}
              >
                Logout
              </Button>
            </Popover.Dropdown>
          </Popover>
        ) : (
          <div onClick={logout} className="cursor-pointer">
            <Avatar radius="xl" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Navbar;
