'use client';

import { Avatar, Button, Drawer, NavLink, Popover } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlignLeft,
  IconDoorExit,
  IconUserCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { cn } from '@/utils/class';

import AiButton from '../ai-button';

type NavbarLinkProps = React.ComponentProps<'a'> & {
  active?: boolean;
  classNames?: {
    root?: string;
    underline?: string;
  };
};

const NavbarLink = ({
  className,
  children,
  classNames,
  active,
  ...props
}: NavbarLinkProps) => {
  return (
    <a
      className={cn(
        'relative hover:text-orange-500 transition-colors text-base-black',
        active && 'text-orange-500 font-medium',
        className,
        classNames?.root,
      )}
      {...props}
    >
      {children}
      <span
        className={cn(
          'absolute left-1/2 -translate-x-1/2 -bottom-2 bg-orange-500 rounded-full h-1.5 w-10 hidden',
          active && 'block',
          classNames?.underline,
        )}
      />
    </a>
  );
};

const navbarLinks = [
  {
    title: 'Discover',
    href: '/ ',
  },
  {
    title: 'Experiences',
    href: '/experiences/8efd1b59-fc69-4290-8bf3-20f39dff72e6',
  },
  // {
  //   title: 'Stories',
  //   href: '/stories',
  // },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const role = localStorage.getItem('role') || '';
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleAiButtonClicked = () => {
    setIsMenuOpen(false);
    if (user) {
      router.push('/stories/new');
    } else {
      notifications.show({
        title: 'Member-only feature',
        message: 'Please login to use this feature!',
        color: 'yellow',
      });
      router.push('/auth/login');
    }
  };

  const handleMenuElementClick = (href: string) => {
    router.replace(href);
    setIsMenuOpen(false);
  };

  return (
    <>
      {isMobile && pathname === '/' && pathname.includes('experiences') && (
        <AiButton asFloating onClick={handleAiButtonClicked} />
      )}
      <nav className="border-b border-base-black/25">
        <div className="lg:max-w-pc mx-auto flex items-center justify-between p-4">
          <button
            className="lg:hidden flex-1"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <IconAlignLeft className="size-6 text-base-black" />
          </button>
          <div className="flex-10 flex justify-center lg:justify-start">
            <Link
              href={role === 'business' ? '/business' : '/'}
              className="text-[26px] leading-none font-oswald font-semibold text-orange-500 text-nowrap"
            >
              Travel Buddy.
            </Link>
          </div>
          <ul className="mx-auto hidden lg:flex gap-8 flex-40 place-content-center align-center justify-center">
            {navbarLinks.map((link) => (
              <NavbarLink
                key={link.href}
                href={link.href}
                active={pathname!.startsWith(link.href)}
                onClick={() => handleMenuElementClick(link.href)}
              >
                {link.title}
              </NavbarLink>
            ))}
          </ul>
          <div className="hidden lg:flex mr-4">
            <AiButton
              className="hidden lg:flex cursor-pointer"
              onClick={handleAiButtonClicked}
            />
          </div>
          {user ? (
            <Popover>
              <Popover.Target>
                <Avatar
                  src={user.media_assets?.url ?? null}
                  // alt={user.email}
                  name={user.username}
                  className="flex-1 max-w-px"
                  imageProps={{ width: '10px', height: '10px' }}
                  color="initials"
                />
              </Popover.Target>
              <Popover.Dropdown className="flex flex-col gap-2">
                <Button onClick={() => router.push('/profile')}>
                  <IconUserCircle color="white" /> Profile
                </Button>
                <Button onClick={logout}>
                  <IconDoorExit color="white" /> Logout
                </Button>
              </Popover.Dropdown>
            </Popover>
          ) : (
            // <div className="flex-1 flex justify-end items-center gap-4">
            <Link href="/auth/login">
              <Button className="rounded-3xl">Login</Button>
            </Link>
            // </div>
          )}
        </div>
      </nav>
      <Drawer opened={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <div className="flex flex-col gap-2">
          {navbarLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              component={Link}
              label={link.title}
              active={pathname!.startsWith(link.href)}
              onClick={() => handleMenuElementClick(link.href)}
            />
          ))}
          {/* <>
            <AiButton
              className="lg:flex mr-l"
              onClick={handleAiButtonClicked}
            />
          </> */}
        </div>
      </Drawer>
    </>
  );
};

export default Navbar;
