// ProtectedLayout.jsx — Layout compartido por todas las páginas protegidas.
// Proporciona: Sidebar, BottomNav, y contexto para abrir el sidebar desde cualquier página.
import { useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

const SidebarContext = createContext(() => {});

// Hook para que cualquier página protegida pueda abrir el sidebar
export const useSidebar = () => useContext(SidebarContext);

export function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={() => setSidebarOpen(true)}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {children}
      <BottomNav />
    </SidebarContext.Provider>
  );
}
