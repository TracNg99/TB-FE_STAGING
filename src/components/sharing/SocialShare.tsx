'use client';

import { notifications } from '@mantine/notifications';
import { useCallback, useId, useMemo } from 'react';
import { FaFacebookF, FaLink, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';

interface SocialShareProps {
  storyTitle: string;
  storyUrl: string;
}

export default function SocialShare({
  storyTitle,
  storyUrl,
}: Readonly<SocialShareProps>) {
  const isMobile = useMemo(
    () =>
      typeof window !== 'undefined' &&
      /Mobi|Android/i.test(navigator.userAgent),
    [],
  );

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(storyUrl);
    if (!isMobile) {
      notifications.show({
        title: 'Link copied!',
        message: 'Story link has been copied to clipboard',
        color: 'green',
      });
    }
  }, [storyUrl, isMobile]);

  const handleFacebookShare = useCallback(() => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }, [storyUrl]);

  const handleLinkedInShare = useCallback(() => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  }, [storyUrl]);

  const handleTwitterShare = useCallback(() => {
    const text = `Check out this travel story: ${storyTitle}`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(storyUrl)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  }, [storyTitle, storyUrl]);

  const handleInstagramShare = useCallback(() => {
    // NOTE: Instagram doesn't allow direct URL pre-filling due to security restrictions
    // We'll just open Instagram app/web where users can manually share
    if (isMobile) {
      // Try to open Instagram app first
      window.location.href = 'instagram://';
      // Fallback to web version after a delay
      setTimeout(() => {
        window.open('https://www.instagram.com/direct/inbox', '_blank');
      }, 1000);
    } else {
      window.open('https://www.instagram.com/direct/inbox', '_blank');
    }
  }, [isMobile]);

  return (
    <>
      {/* Hidden SVG for Ins gradient definition */}
      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient
            id="instagramGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#ff41b4" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center gap-3">
        <button
          onClick={handleFacebookShare}
          className="p-2 text-blue-600 hover:bg-blue-100 hover:cursor-pointer rounded-full transition-colors"
          aria-label="Share on Facebook"
        >
          <FaFacebookF size={18} />
        </button>

        <button
          onClick={handleLinkedInShare}
          className="p-2 text-blue-700 hover:bg-blue-200 hover:cursor-pointer rounded-full transition-colors"
          aria-label="Share on LinkedIn"
        >
          <FaLinkedinIn size={18} />
        </button>

        <button
          onClick={handleTwitterShare}
          className="p-2 text-black hover:bg-zinc-300 hover:cursor-pointer rounded-full transition-colors"
          aria-label="Share on X (Twitter)"
        >
          <FaXTwitter size={18} />
        </button>

        <button
          onClick={handleInstagramShare}
          className="p-2 hover:bg-pink-200 hover:cursor-pointer rounded-full transition-colors"
          aria-label="Open Instagram to share"
        >
          <InstagramGradientIcon size={18} />
        </button>

        <button
          onClick={handleCopyLink}
          className="p-2 text-gray-600 hover:bg-neutral-200 hover:cursor-pointer rounded-full transition-colors"
          aria-label="Copy link"
        >
          <FaLink size={18} />
        </button>
      </div>
    </>
  );
}

type InstagramGradientIconProps = {
  size?: number | string;
  className?: string;
  title?: string;
};

function InstagramGradientIcon({
  size = 18,
  className,
  title = 'Instagram',
}: Readonly<InstagramGradientIconProps>) {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 448 512"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="35%" stopColor="#fa7e1e" />
          <stop offset="60%" stopColor="#d62976" />
          <stop offset="85%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9 0 63.6 51.3 114.9
           114.9 114.9 63.6 0 114.9-51.3 114.9-114.9 0-63.6-51.3-114.9-114.9-114.9zm0
           189.6c-41.2 0-74.7-33.5-74.7-74.7 0-41.2 33.5-74.7 74.7-74.7s74.7 33.5
           74.7 74.7c0 41.2-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12.1 27-27 27-14.9
           0-27-12.1-27-27s12.1-27 27-27c14.9 0 27 12.1 27 27zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9
           -26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1-26.2 26.2-34.4
           58-36.2 93.9-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9 26.2 26.2 58 34.4 93.9 36.2
           37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9
           2.1-37 2.1-147.8 0-184.8zm-48.5 224.7c-7.8 19.7-23 35-42.6 42.6-29.5 11.7-99.5 9-132.4 9s-102.9
           2.6-132.4-9c-19.7-7.8-35-23-42.6-42.6-11.7-29.5-9-99.5-9-132.4s-2.6-102.9 9-132.4c7.8-19.7
           23-35 42.6-42.6 29.5-11.7 99.5-9 132.4-9s102.9-2.6 132.4 9c19.7 7.8 35 23 42.6 42.6
           11.7 29.5 9 99.5 9 132.4s2.6 102.9-9 132.4z"
      />
    </svg>
  );
}
