import React from 'react';

import Chatbox from '@/components/chatbot/chatbox';
import { cn } from '@/utils/class';

const StickyChatbox = (props: React.ComponentProps<typeof Chatbox>) => (
  <div className="fixed left-0 md:sticky bottom-18 md:bottom-4 z-40 w-full mx-auto">
    <div
      className={cn('w-full xs:w-[90%] mx-auto', {
        'w-[90%]': props.isMobile && !props.isHome,
      })}
    >
      <Chatbox {...props} />
    </div>
  </div>
);

export default StickyChatbox;
