import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type PageActionsValue = {
  onNewLink: (() => void) | null;
  setOnNewLink: (fn: (() => void) | null) => void;
  onEditLayout: (() => void) | null;
  editLayoutActive: boolean;
  setOnEditLayout: (fn: (() => void) | null, active: boolean) => void;
};

const PageActionsContext = createContext<PageActionsValue>({
  onNewLink: null,
  setOnNewLink: () => {},
  onEditLayout: null,
  editLayoutActive: false,
  setOnEditLayout: () => {},
});

export function PageActionsProvider({ children }: { children: ReactNode }) {
  const [onNewLink, setOnNewLinkState] = useState<(() => void) | null>(null);
  const setOnNewLink = useCallback((fn: (() => void) | null) => {
    setOnNewLinkState(() => fn);
  }, []);

  const [onEditLayout, setOnEditLayoutState] = useState<(() => void) | null>(null);
  const [editLayoutActive, setEditLayoutActive] = useState(false);
  const setOnEditLayout = useCallback((fn: (() => void) | null, active: boolean) => {
    setOnEditLayoutState(() => fn);
    setEditLayoutActive(active);
  }, []);

  return (
    <PageActionsContext.Provider value={{ onNewLink, setOnNewLink, onEditLayout, editLayoutActive, setOnEditLayout }}>
      {children}
    </PageActionsContext.Provider>
  );
}

export function usePageActions() {
  return useContext(PageActionsContext);
}
