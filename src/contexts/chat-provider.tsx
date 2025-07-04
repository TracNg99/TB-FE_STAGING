'use client';

import React, { ReactNode, createContext, useContext, useState } from 'react';

interface ChatContextType {
  resetState: boolean;
  triggerReset: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [resetState, setResetState] = useState(false);

  const triggerReset = () => {
    setResetState(true);
    // Reset back to false after a short delay to allow consumers to react
    setTimeout(() => setResetState(false), 50);
  };

  return (
    <ChatContext.Provider value={{ resetState, triggerReset }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
