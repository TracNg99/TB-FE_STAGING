'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AdminCardContextType = {
  showCard: boolean;
  openCard: () => void;
  closeCard: () => void;
};

const AdminCardContext = createContext<AdminCardContextType>({
  showCard: false,
  openCard: () => { },
  closeCard: () => { },
});

export const useAdminCardModal = () => useContext(AdminCardContext);

export function AdminCardProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [showCard, setShowCard] = useState(false);
  const openCard = useCallback(() => {
    setShowCard(true);
  }, []);

  const closeCard = useCallback(() => {
    setShowCard(false);
  }, []);

  const cardCtxValues = useMemo(
    () => ({
      showCard,
      openCard,
      closeCard,
    }),
    [showCard, openCard, closeCard],
  );

  return (
    <AdminCardContext.Provider value={cardCtxValues}>
      {children}
    </AdminCardContext.Provider>
  );
}
