'use client';

import { Avatar, Button, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { useChat } from '@/contexts/chat-provider';
import { useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

import AiButton from '../ai-button';

const navbarLinks = [
  {
    title: 'Home',
    href: '/',
    icon: '/assets/home.svg',
  },
  {
    title: 'Discover',
    href: '/discoveries',
    icon: '/assets/discover.svg',
  },
  // {
  //   title: 'Experiences',
  //   href: '/experiences/8efd1b59-fc69-4290-8bf3-20f39dff72e6',
  //   icon: '/assets/backpack.svg',
  // },
  {
    title: 'Stories',
    icon: '/assets/sparkle_pen.svg',
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setIsSidebarOpen } = useSidebar();
  const { triggerReset } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameSplit = pathname.split('/');

  const [activeTab, setActiveTab] = useState('/');

  useEffect(() => {
    const checkPath = pathnameSplit.find((path) => path.length > 10)
      ? `/${pathnameSplit.slice(1, -1).join('/')}`
      : pathname;
    setActiveTab(checkPath);
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
    setActiveTab('/stories/new');
    router.push('/stories/new');
  };

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    router.push(href);
  };

  return (
    <aside
      onMouseEnter={() => setIsSidebarOpen(true)}
      // onMouseLeave={() => setIsSidebarOpen(false)}
      className="flex w-24 flex-shrink-0 flex-col items-center border-r border-gray-200 bg-white py-4 z-10"
    >
      <Link href="/" onClick={triggerReset}>
        <Image
          src="/assets/travelbuddy_logo_icon.svg"
          alt="Logo"
          width={40}
          height={40}
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
              activeTab === link.href && 'bg-purple-100/50',
              activeTab !== link.href && 'bg-transparent text-gray-500',
            )}
            key={index}
          >
            {link.title !== 'Stories' && (
              <Image src={link.icon} alt="Home" width={28} height={28} />
            )}
            {link.title === 'Stories' && (
              <div
                className={cn(
                  activeTab === '/stories/new' &&
                    'p-2 bg-purple-100/50 rounded-lg',
                )}
              >
                <AiButton className="flex cursor-pointer" />
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
          <Link href="/auth/login">
            <Avatar radius="xl" />
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Navbar;
