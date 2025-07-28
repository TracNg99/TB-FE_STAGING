import React from 'react';

import Chatbox from '@/components/chatbot/chatbox';

const StickyChatbox = (props: React.ComponentProps<typeof Chatbox>) => (
  <div className="fixed left-0 md:sticky bottom-18 md:bottom-4 z-40 w-full mx-auto">
    <div className="w-[80%] md:w-[90%]  mx-auto ">
      <Chatbox {...props} />
    </div>
  </div>
);

export default StickyChatbox;
