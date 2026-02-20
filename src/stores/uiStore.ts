import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      activeModal: null,
      modalData: null,

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
      closeMobileMenu: () => set({ mobileMenuOpen: false }),
      openModal: (id, data) => set({ activeModal: id, modalData: data ?? null }),
      closeModal: () => set({ activeModal: null, modalData: null }),
    }),
    {
      name: 'linkedweld-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
