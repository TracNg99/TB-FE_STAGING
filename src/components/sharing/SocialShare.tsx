'use client';

import { notifications } from '@mantine/notifications';
import { useCallback, useMemo } from 'react';
import { FaFacebookF, FaLink, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { PiShareFatDuotone } from 'react-icons/pi';

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

  const canWebShare = useMemo(
    () => typeof navigator !== 'undefined' && 'share' in navigator && isMobile, // only allow system share on mobile
    [isMobile],
  );

  const handleSystemShare = useCallback(async () => {
    if (!canWebShare) return false;
    try {
      await (navigator as any).share({
        title: storyTitle,
        text: 'Check out this travel story',
        url: storyUrl,
      });
      return true;
    } catch {
      return false;
    }
  }, [canWebShare, storyTitle, storyUrl]);

  const handleCopyLink = useCallback(() => {
    const notifySuccess = () =>
      notifications.show({
        title: 'Link copied!',
        message: 'Story link has been copied to clipboard',
        color: 'green',
      });

    const notifyManual = () =>
      notifications.show({
        title: 'Copy the link',
        message:
          'Your browser blocked programmatic copy. Please select and copy the URL.',
        color: 'yellow',
      });

    const notifyError = () =>
      notifications.show({
        title: 'Unable to copy',
        message: 'Please copy the URL manually.',
        color: 'red',
      });

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(storyUrl)
        .then(notifySuccess)
        .catch(() => {
          try {
            // Create a temporary readonly input so user can copy manually
            const input = document.createElement('input');
            input.value = storyUrl;
            input.readOnly = true;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            input.style.pointerEvents = 'none';
            input.setAttribute('aria-hidden', 'true');
            document.body.appendChild(input);

            input.select();
            input.setSelectionRange(0, input.value.length);

            notifyManual();

            // Clean up shortly after
            setTimeout(() => {
              // Keep selection momentarily in case the user opens the selection UI
              document.body.removeChild(input);
            }, 1500);
          } catch {
            notifyError();
          }
        });
    } else {
      // No clipboard API available
      try {
        const input = document.createElement('input');
        input.value = storyUrl;
        input.readOnly = true;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        input.setAttribute('aria-hidden', 'true');
        document.body.appendChild(input);

        input.select();
        input.setSelectionRange(0, input.value.length);

        // Without execCommand, we cannot force-copy; prompt the user.
        notifyManual();

        setTimeout(() => {
          document.body.removeChild(input);
        }, 1500);
      } catch {
        notifyError();
      }
    }
  }, [storyUrl]);

  const handleFacebookShare = useCallback(async () => {
    let usedSystem = false;
    if (isMobile) {
      usedSystem = await handleSystemShare();
    }
    if (usedSystem) return;
          
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      storyUrl,
    )}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }, [handleSystemShare, storyUrl, isMobile]);

  const handleLinkedInShare = useCallback(async () => {
    let usedSystem = false;
    if (isMobile) {
      usedSystem = await handleSystemShare();
    }
    if (usedSystem) return;

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      storyUrl,
    )}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  }, [handleSystemShare, storyUrl, isMobile]);

  const handleTwitterShare = useCallback(async () => {
    let usedSystem = false;
    if (isMobile) {
      usedSystem = await handleSystemShare();
    }
    if (usedSystem) return;

    const text = `Check out this travel story: ${storyTitle}`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(storyUrl)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
  }, [handleSystemShare, storyTitle, storyUrl, isMobile]);

  // const handleInstagramShare = useCallback(async () => {
  //   let usedSystem = false;
  //   if (isMobile) {
  //     usedSystem = await handleSystemShare();
  //   }
  //   if (usedSystem) return;

  //   if (isMobile) {
  //     window.location.href = 'instagram://';
  //     setTimeout(() => {
  //       window.open('https://www.instagram.com/direct/inbox', '_blank');
  //     }, 1000);
  //   } else {
  //     window.open('https://www.instagram.com/direct/inbox', '_blank');
  //   }
  // }, [handleSystemShare, isMobile]);

  return (
    <>
      {/* INFO: Hidden gradient for Instagram icon */}
      {/* <svg width="0" height="0" className="hidden">
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
      </svg> */}

      <div className="hidden md:flex items-center gap-3">
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

        {/* <button
          onClick={handleInstagramShare}
          className="p-2 hover:bg-pink-200 hover:cursor-pointer rounded-full transition-colors"
          aria-label="Open Instagram to share"
        >
          <InstagramGradientIcon size={18} />
        </button> */}

        <button
          onClick={handleCopyLink}
          className="p-2 text-gray-600 hover:bg-neutral-200 hover:cursor-pointer rounded-full transition-colors"
          aria-label="Copy link"
        >
          <FaLink size={18} />
        </button>
      </div>

      <div className="flex md:hidden">
        <button
          onClick={handleSystemShare}
          className="p-2 text-gray-700 hover:bg-neutral-200 rounded-full transition-colors"
          aria-label="Share"
        >
          <PiShareFatDuotone size={20} />
        </button>
      </div>
    </>
  );
}

// type InstagramGradientIconProps = {
//   size?: number | string;
//   className?: string;
//   title?: string;
// };

// function InstagramGradientIcon({
//   size = 18,
//   className,
//   title = 'Instagram',
// }: Readonly<InstagramGradientIconProps>) {
//   const gradientId = useId().replace(/:/g, '');

//   return (
//     <svg
//       viewBox="0 0 448 512"
//       width={size}
//       height={size}
//       role="img"
//       aria-label={title}
//       className={className}
//     >
//       <title>{title}</title>
//       <defs>
//         <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
//           <stop offset="0%" stopColor="#feda75" />
//           <stop offset="35%" stopColor="#fa7e1e" />
//           <stop offset="60%" stopColor="#d62976" />
//           <stop offset="85%" stopColor="#962fbf" />
//           <stop offset="100%" stopColor="#4f5bd5" />
//         </linearGradient>
//       </defs>
//       <path
//         fill={`url(#${gradientId})`}
//         d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9 0 63.6 51.3 114.9
//            114.9 114.9 63.6 0 114.9-51.3 114.9-114.9 0-63.6-51.3-114.9-114.9-114.9zm0
//            189.6c-41.2 0-74.7-33.5-74.7-74.7 0-41.2 33.5-74.7 74.7-74.7s74.7 33.5
//            74.7 74.7c0 41.2-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12.1 27-27 27-14.9
//            0-27-12.1-27-27s12.1-27 27-27c14.9 0 27 12.1 27 27zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9
//            -26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1-26.2 26.2-34.4
//            58-36.2 93.9-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9 26.2 26.2 58 34.4 93.9 36.2
//            37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9
//            2.1-37 2.1-147.8 0-184.8zm-48.5 224.7c-7.8 19.7-23 35-42.6 42.6-29.5 11.7-99.5 9-132.4 9s-102.9
//            2.6-132.4-9c-19.7-7.8-35-23-42.6-42.6-11.7-29.5-9-99.5-9-132.4s-2.6-102.9 9-132.4c7.8-19.7
//            23-35 42.6-42.6 29.5-11.7 99.5-9 132.4-9s102.9-2.6 132.4 9c19.7 7.8 35 23 42.6 42.6
//            11.7 29.5 9 99.5 9 132.4s2.6 102.9-9 132.4z"
//       />
//     </svg>
//   );
// }
