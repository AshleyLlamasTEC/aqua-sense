// resources/js/context/SidebarContext.jsx
/**
 * Contexto del sidebar.
 * Fuente única de verdad para el estado isCollapsed.
 * Persiste la preferencia en localStorage para que
 * el usuario no pierda su configuración al navegar.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const SIDEBAR_KEY = 'sidebar-collapsed';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Leer preferencia guardada al inicializar
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Persistir cambios
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(isCollapsed));
    } catch {
      // localStorage no disponible (modo privado extremo), ignorar silenciosamente
    }
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar debe usarse dentro de <SidebarProvider>');
  }
  return ctx;
};
