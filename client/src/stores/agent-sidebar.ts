"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type AgentSidebarState = {
  isVisible: boolean
  sidebarSize: number // percent 0..100
  setVisible: (visible: boolean) => void
  toggle: () => void
  setSidebarSize: (size: number) => void
}

export const useAgentSidebarStore = create<AgentSidebarState>()(
  persist(
    (set, get) => ({
      isVisible: false,
      sidebarSize: 25,
      setVisible: (visible) => set({ isVisible: visible }),
      toggle: () => set({ isVisible: !get().isVisible }),
      setSidebarSize: (size) => set({ sidebarSize: Math.max(10, Math.min(90, size)) }),
    }),
    {
      name: "agent_sidebar_store",
      partialize: (state) => ({ isVisible: state.isVisible, sidebarSize: state.sidebarSize }),
    }
  )
)


