'use client';

import { Avatar, Button, Popover, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// import Image from 'next/image';
import { BiCompass } from 'react-icons/bi';
import { BsPersonCircle } from 'react-icons/bs';
import { GrDocumentText } from 'react-icons/gr';
import { IoMdSearch } from 'react-icons/io';

import { useAuth } from '@/contexts/auth-provider';
// import { useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/utils/class';

// import AiButton from '../ai-button';

const navbarLinks = [
  {
    title: 'Discover',
    href: '/',
    icon: <BiCompass />,
  },
  {
    title: 'Experiences',
    href: '/discoveries',
    icon: <IoMdSearch />,
  },
  {
    title: 'Stories',
    // href: '/stories/new',
    icon: <GrDocumentText />,
  },
  // {
  //   title: 'Profile',
  //   href: '/profile',
  //   icon: <BsPersonCircle />,
  // },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  //   const { setIsSidebarOpen } = useSidebar();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('home');

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
    router.push(href);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-16 w-full items-center justify-around border-t border-gray-200 bg-white md:hidden">
      {navbarLinks.map((link, index) => (
        <UnstyledButton
          onClick={() =>
            link.title === 'Stories'
              ? handleAiButtonClicked()
              : handleTabChange(link.href ?? '/')
          }
          className={cn(
            'flex flex-col items-center gap-1 rounded-lg p-2',
            activeTab === link.href && 'bg-orange-100/50',
          )}
          key={index}
        >
          {link.icon}
          <span className="text-xs font-medium">{link.title}</span>
        </UnstyledButton>
      ))}
      <div>
        {user ? (
          <Popover position="top-end" withArrow>
            <Popover.Target>
              <UnstyledButton
                onClick={() => handleTabChange('/profile')}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg p-2',
                  activeTab === '/profile' && 'bg-orange-100/50',
                )}
              >
                <Avatar
                  src={user.media_assets?.url ?? null}
                  name={user.username}
                  radius="xl"
                />
                <span className="text-xs font-medium">Profile</span>
              </UnstyledButton>
            </Popover.Target>
            <Popover.Dropdown>
              <Button
                fullWidth
                variant="subtle"
                onClick={() => router.push('/profile')}
              >
                Profile
              </Button>
              <Button fullWidth variant="subtle" color="red" onClick={logout}>
                Logout
              </Button>
            </Popover.Dropdown>
          </Popover>
        ) : (
          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-1 rounded-lg p-2"
          >
            <BsPersonCircle />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        )}
      </div>
    </footer>
  );
};

export default Navbar;
