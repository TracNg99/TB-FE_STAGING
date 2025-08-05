'use client';

import { createContext, useContext, useState } from 'react';

type AdminCardContextType = {
  showCard: boolean;
  openCard: () => void;
  closeCard: () => void;
};

const AdminCardContext = createContext<AdminCardContextType>({
  showCard: false,
  openCard: () => {},
  closeCard: () => {},
});

export const useAdminCardModal = () => useContext(AdminCardContext);

export function AdminCardProvider({ children }: { children: React.ReactNode }) {
  const [showCard, setShowCard] = useState(false);

  const openCard = () => {
    console.log('Showing experience card');
    setShowCard(true);
  };

  const closeCard = () => {
    console.log('Hiding experience card');
    setShowCard(false);
  };

  return (
    <AdminCardContext.Provider value={{ showCard, openCard, closeCard }}>
      {children}
    </AdminCardContext.Provider>
  );
}
