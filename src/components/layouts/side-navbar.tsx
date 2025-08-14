'use client';

import { Avatar, Button, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Image from 'next/image';
// import { CgHomeAlt as HomeIcon } from "react-icons/cg";
// import { IoSearch as DiscoverIcon } from "react-icons/io5";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Translation } from '@/components/translation';
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
    title: 'navigation.home',
    href: '/',
    icon: IconHome,
  },
  {
    title: 'navigation.discover',
    href: 'discoveries',
    icon: IconDiscover,
  },
  {
    title: 'navigation.stories',
    href: '/stories/new',
    icon: IconStory,
  },
];

const businessLinks = [
  {
    title: 'navigation.discover',
    href: 'discoveries',
    icon: IconDiscover,
  },
];

const Navbar = () => {
  const role = localStorage.getItem('role') || '';
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

    // Highlight stories for all /stories/* pages including /stories/new
    if (currentPath.startsWith('stories')) {
      setActiveTab('stories');
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

  const handleStoriesClicked = () => {
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
    setIsSidebarOpen(true);
  };

  return (
    <Translation>
      {(t) => (
        <aside
          onMouseEnter={() => setIsSidebarOpen(true)}
          // onMouseLeave={() => setIsSidebarOpen(false)}
          className="h-full w-20 flex flex-col items-center border-r border-gray-200 bg-white py-4 overflow-visible"
        >
          <Link href="/" onClick={triggerReset}>
            <Image
              src="/assets/travelbuddy_logo_icon.svg"
              alt="Logo"
              width={56}
              height={56}
            />
          </Link>
          <nav className="mt-6 flex flex-grow flex-col items-center gap-3">
            {(role === 'business' ? businessLinks : navbarLinks).map(
              (link, index) => (
                <UnstyledButton
                  onClick={() =>
                    link.title === 'navigation.stories'
                      ? handleStoriesClicked()
                      : handleTabChange(link.href ?? '/')
                  }
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-lg p-2 w-14 h-14 transition-all duration-200 hover:bg-orange-100/50',
                    activeTab === link.href && 'bg-[#FFEEE6]',
                    activeTab !== link.href && 'bg-transparent text-gray-500',
                  )}
                  key={index}
                >
                  {link.title !== 'navigation.stories' && (
                    <div className="flex items-center justify-center w-full">
                      <IconHandler
                        IconComponent={link.icon}
                        className={cn('size-[30px]')}
                      />
                    </div>
                  )}
                  {link.title === 'navigation.stories' && (
                    <div className="flex items-center justify-center w-full">
                      <AiButton
                        className="flex cursor-pointer"
                        altIcon={
                          <IconHandler
                            IconComponent={link.icon}
                            className={cn('size-[30px] text-gray-700')}
                          />
                        }
                      />
                    </div>
                  )}
                  <span className="text-[10px] font-medium leading-tight text-center">
                    {t(link.title)}
                  </span>
                </UnstyledButton>
              ),
            )}
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
                    {t('navigation.profile')}
                  </Button>
                  <Button
                    className="bg-red-500 text-white"
                    fullWidth
                    variant="subtle"
                    color="red"
                    onClick={logout}
                  >
                    {t('navigation.logout')}
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
      )}
    </Translation>
  );
};

export default Navbar;
