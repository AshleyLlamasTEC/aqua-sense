/**
 * Contexto del Sidebar con separación de estados
 *
 * Estados separados:
 * - isCollapsed: controla ancho en desktop (persiste en localStorage)
 * - isOpen: controla visibilidad en mobile (NO persiste)
 *
 * Comportamiento:
 * - Desktop: sidebar siempre visible, puede colapsarse
 * - Mobile: sidebar oculto por defecto, se abre como overlay
 */

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useMobile } from '../hooks/useMobile';

// Crear el contexto
export const SidebarContext = createContext({});

/**
 * Provider del sidebar con estados separados
 */
export const SidebarProvider = ({ children }) => {
  const { isMobile } = useMobile();

  // Estado 1: Colapso en desktop (persistente)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('AquaSenseIoT-sidebar-collapsed');
      // Solo restaurar si es desktop, en mobile ignorar
      if (saved !== null && window.innerWidth >= 768) {
        return saved === 'true';
      }
    }
    return false; // Desktop: expandido por defecto
  });

  // Estado 2: Visibilidad en mobile (NO persistente)
  const [isOpen, setIsOpen] = useState(false);

  // Persistir SOLO isCollapsed (estado de desktop)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      localStorage.setItem('AquaSenseIoT-sidebar-collapsed', isCollapsed);
    }
  }, [isCollapsed, isMobile]);

  // Funciones para desktop (colapso)
  const toggleCollapse = useCallback(() => {
    if (!isMobile) {
      setIsCollapsed(prev => !prev);
    }
  }, [isMobile]);

  const collapseSidebar = useCallback(() => {
    if (!isMobile && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isMobile, isCollapsed]);

  const expandSidebar = useCallback(() => {
    if (!isMobile && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isMobile, isCollapsed]);

  // Funciones para mobile (apertura/cierre)
  const openMobileSidebar = useCallback(() => {
    if (isMobile) {
      setIsOpen(true);
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
    }
  }, [isMobile]);

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) {
      setIsOpen(false);
      // Restaurar scroll del body
      document.body.style.overflow = '';
    }
  }, [isMobile]);

  const toggleMobileSidebar = useCallback(() => {
    if (isMobile) {
      if (isOpen) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    }
  }, [isMobile, isOpen, openMobileSidebar, closeMobileSidebar]);

  // Limpiar scroll al desmontar
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Valores a exponer
  const value = useMemo(() => ({
    // Estados
    isCollapsed,           // Desktop: colapsado?
    isOpen,                // Mobile: visible?

    // Desktop functions
    toggleCollapse,        // Alternar colapso en desktop
    collapseSidebar,       // Colapsar en desktop
    expandSidebar,         // Expandir en desktop

    // Mobile functions
    openMobileSidebar,     // Abrir en mobile
    closeMobileSidebar,    // Cerrar en mobile
    toggleMobileSidebar,   // Alternar en mobile

    // Utilidad
    isMobile,              // Detectar mobile
  }), [
    isCollapsed,
    isOpen,
    toggleCollapse,
    collapseSidebar,
    expandSidebar,
    openMobileSidebar,
    closeMobileSidebar,
    toggleMobileSidebar,
    isMobile
  ]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
