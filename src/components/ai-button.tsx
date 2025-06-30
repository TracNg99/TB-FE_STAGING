import { IconSparkles } from '@tabler/icons-react';
import Image from 'next/image';

import { cn } from '@/utils/class';

const AiButton = ({
  className,
  // displayText,
  additionalClassName,
  asFloating,
  ...props
}: React.ComponentProps<'button'> & {
  additionalClassName?: string;
  displayText?: string;
  asFloating?: boolean;
}) => {
  if (asFloating) {
    return (
      <div className="fixed bottom-6 right-24 flex flex-col items-end z-50">
        <button
          className="bg-orange-600 hover:bg-orange-500 rounded-full shadow-lg p-3 transition cursor-pointer"
          aria-label="Open chatbot"
          {...props}
        >
          <Image
            src="/assets/sparkle_pen.svg"
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
        `rounded-full p-2 gap-2
        flex items-center justify-center
        ${additionalClassName ?? 'text-purple-500 bg-purple-50 hover:bg-purple-100/50'}
        text-sm font-medium transition-colors border-2 border-purple-500`,
        className,
      )}
      {...props}
    >
      <IconSparkles className="size-6" />
      {/* {displayText} */}
    </button>
  );
};

export default AiButton;
