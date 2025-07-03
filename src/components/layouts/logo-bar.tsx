'use client';

import Link from 'next/link';

// import { usePathname } from 'next/navigation';

const TransitionTopbar = () => {
  const role = localStorage.getItem('role') || '';
  //   const pathname = usePathname();

  return (
    <>
      <nav className="border-b border-base-black/25">
        <div className="lg:max-w-pc mx-auto flex items-center justify-between p-4">
          <div className="flex-10 flex justify-center">
            <Link
              href={role === 'business' ? '/business' : '/'}
              className="text-[26px] leading-none font-oswald font-semibold text-orange-500 text-nowrap"
            >
              Travel Buddy.
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default TransitionTopbar;
