import { createContext, useContext, useState, ReactNode } from 'react';

type AppRole = 'admin' | 'collaborator' | 'paid' | 'free' | null;

interface ViewAsContextType {
  viewAsRole: AppRole | 'unauthenticated';
  setViewAsRole: (role: AppRole | 'unauthenticated') => void;
  isViewingAs: boolean;
  clearViewAs: () => void;
}

const ViewAsContext = createContext<ViewAsContextType | undefined>(undefined);

export const ViewAsProvider = ({ children }: { children: ReactNode }) => {
  const [viewAsRole, setViewAsRole] = useState<AppRole | 'unauthenticated' | null>(null);

  const isViewingAs = viewAsRole !== null;

  const clearViewAs = () => {
    setViewAsRole(null);
  };

  return (
    <ViewAsContext.Provider
      value={{
        viewAsRole: viewAsRole || null,
        setViewAsRole,
        isViewingAs,
        clearViewAs,
      }}
    >
      {children}
    </ViewAsContext.Provider>
  );
};

export const useViewAs = () => {
  const context = useContext(ViewAsContext);
  if (context === undefined) {
    throw new Error('useViewAs must be used within a ViewAsProvider');
  }
  return context;
};
