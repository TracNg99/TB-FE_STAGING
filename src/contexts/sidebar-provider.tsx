'use client';

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  experiencesStatus: string;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setExperiencesStatus: Dispatch<SetStateAction<string>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [experiencesStatus, setExperiencesStatus] = useState('active');

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        experiencesStatus,
        setExperiencesStatus,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
