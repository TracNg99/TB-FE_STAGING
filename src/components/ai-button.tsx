import Image from 'next/image';
import React from 'react';

import { cn } from '@/utils/class';

const AiButton = ({
  className,
  displayText,
  additionalClassName,
  asFloating,
  altIcon,
  ...props
}: React.ComponentProps<'button'> & {
  additionalClassName?: string;
  displayText?: string;
  asFloating?: boolean;
  altIcon?: React.ReactNode;
}) => {
  if (asFloating) {
    return (
      <div className="fixed bottom-6 right-24 flex flex-col items-end z-50">
        <button
          className="bg-purple-200 hover:bg-purple-100 rounded-full shadow-lg p-3 transition cursor-pointer"
          aria-label="Open chatbot"
          {...props}
        >
          <Image
            src="/assets/story.svg"
            alt="Sparkle Pen"
            width={40}
            height={40}
          />
        </button>
      </div>
    );
  }
  return (
    <button
      className={cn(
        `rounded-full gap-2
        flex items-center justify-center
        ${additionalClassName}
        text-sm font-medium transition-colors`,
        className,
      )}
      {...props}
    >
      {altIcon || (
        <Image src="/assets/story.svg" alt="Story" width={40} height={40} />
      )}
      {displayText}
    </button>
  );
};

export default AiButton;
