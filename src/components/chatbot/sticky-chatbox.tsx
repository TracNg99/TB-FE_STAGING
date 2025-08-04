import React from 'react';

import Chatbox from '@/components/chatbot/chatbox';
import { cn } from '@/utils/class';

interface StickyChatboxProps extends React.ComponentProps<typeof Chatbox> {
  className?: string;
}

/**
 * StickyChatbox - A chatbox component that can be positioned at the bottom or absolutely
 *
 * @param position - 'bottom' for flex layout, 'absolute' for absolute positioning
 * @param className - Additional CSS classes
 */
const StickyChatbox: React.FC<StickyChatboxProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div className={cn('sticky bottom-0 left-0 w-full z-[20]')}>
      <div className="relative">
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-full w-full md:w-[calc(100%+100px)] md:-translate-x-[50px] z-20',
            className,
          )}
        />
        <div className="w-full pt-2 pb-4 z-40 ">
          <Chatbox {...props} />
        </div>
      </div>
    </div>
  );
};

export default StickyChatbox;
