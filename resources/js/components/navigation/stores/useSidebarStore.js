// resources/js/stores/useSidebarStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
  persist(
    (set) => ({
      // Desktop: colapsado (se guarda en localStorage)
      isCollapsed: false,
      // Mobile: abierto (nunca se persiste)
      isMobileOpen: false,

      // Acciones Desktop
      toggleCollapsed: () => set((state) => ({
        isCollapsed: !state.isCollapsed
      })),

      // Acciones Mobile
      openMobile: () => set({ isMobileOpen: true }),
      closeMobile: () => set({ isMobileOpen: false }),
      toggleMobile: () => set((state) => ({
        isMobileOpen: !state.isMobileOpen
      })),
    }),
    {
      name: 'sidebar-storage',
      // Solo persistir isCollapsed, NO isMobileOpen
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
