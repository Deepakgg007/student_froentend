import { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const HeaderVisibilityContext = createContext();

// Define header hide patterns outside component to avoid recreation
const HIDDEN_HEADER_PATHS = [
  /\/challenge\/[\w-]+$/, // Challenge solve pages
  /\/companies\/[\w-]+\/concepts\/[\w-]+\/challenges\/[\w-]+\/solve$/, // Company challenge solve
  /\/course-view\/\d+/, // Course view pages
  /\/quiz/, // Quiz pages
];

export const HeaderVisibilityProvider = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const shouldHideHeader = useMemo(() => {
    return HIDDEN_HEADER_PATHS.some(pattern => pattern.test(pathname));
  }, [pathname]);

  const value = {
    shouldHideHeader,
    currentPath: pathname,
  };

  return (
    <HeaderVisibilityContext.Provider value={value}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
};

export const useHeaderVisibility = () => {
  const context = useContext(HeaderVisibilityContext);
  if (!context) {
    throw new Error('useHeaderVisibility must be used within HeaderVisibilityProvider');
  }
  return context;
};
