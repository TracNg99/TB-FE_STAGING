'use client';

import { IconQrcode } from '@tabler/icons-react';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import QRModal, { baseUrl } from '@/components/qr-code/qr-modal';
import { cn } from '@/utils/class';

interface StickyTitleChipsHeaderProps {
  title: string;
  subTitle: string;
  className?: string;
}

const splitTitleForMobile = (title: string) => {
  // INFO: Split by . ! ? followed by space or end, keeping the delimiter
  const parts = title
    .match(/[^.!?]+[.!?]?/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [title];

  const first = parts[0] ?? '';
  const rest = parts.slice(1).join(' ').trim();
  return { first, rest };
};

const DiscoveriesHeader: React.FC<StickyTitleChipsHeaderProps> = ({
  title,
  subTitle,
  className,
}) => {
  const { first, rest } = useMemo(() => splitTitleForMobile(title), [title]);
  const [qrOpen, setQrOpen] = useState(false);
  const qrPath = `${baseUrl}/discoveries?fromQR=true`;

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div className="lg:mx-0 relative -mx-4 h-28">
        <Image
          src="/assets/wink-discoveries.jpg"
          alt="Discoveries"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover lg:rounded-b-sm"
        />
      </div>

      <div className="block lg:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold -mb-1">{first}</h1>
          <button
            className="ml-2 p-1 rounded text-gray-700 hover:text-orange-500 transition"
            onClick={() => setQrOpen(true)}
            aria-label="Show Discoveries QR"
            title="Show Discoveries QR"
          >
            <IconQrcode className="w-6 h-6" />
          </button>
        </div>
        {rest && <h1 className="text-3xl font-bold -mt-1">{rest}</h1>}
      </div>

      <div className="hidden lg:flex items-center justify-between">
        <h1 className="text-3xl font-bold -mb-2">{title}</h1>
        <button
          className="ml-3 p-1 rounded text-gray-700 hover:text-orange-500 transition"
          onClick={() => setQrOpen(true)}
          aria-label="Show Discoveries QR"
          title="Show Discoveries QR"
        >
          <IconQrcode className="w-6 h-6" />
        </button>
      </div>
      <h2>{subTitle}</h2>

      <QRModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        path={qrPath}
        displayText="Discover Wink experiences"
      />
    </div>
  );
};

export default DiscoveriesHeader;
