"use client"

import React, { createContext, useContext, useMemo } from "react"
import { useAgentSidebarStore } from "@/stores/agent-sidebar"

type AgentSidebarContextValue = {
  isVisible: boolean
  setVisible: (visible: boolean) => void
  toggle: () => void
  sidebarSize: number
  setSidebarSize: (size: number) => void
}

const AgentSidebarContext = createContext<AgentSidebarContextValue | null>(null)

export function AgentSidebarProvider({ children }: { children: React.ReactNode }) {
  const isVisible = useAgentSidebarStore((s) => s.isVisible)
  const setVisible = useAgentSidebarStore((s) => s.setVisible)
  const toggle = useAgentSidebarStore((s) => s.toggle)
  const sidebarSize = useAgentSidebarStore((s) => s.sidebarSize)
  const setSidebarSize = useAgentSidebarStore((s) => s.setSidebarSize)

  const value = useMemo(
    () => ({ isVisible, setVisible, toggle, sidebarSize, setSidebarSize }),
    [isVisible, setVisible, toggle, sidebarSize, setSidebarSize]
  )

  return (
    <AgentSidebarContext.Provider value={value}>{children}</AgentSidebarContext.Provider>
  )
}

export function useAgentSidebar(): AgentSidebarContextValue {
  const ctx = useContext(AgentSidebarContext)
  if (!ctx) throw new Error("useAgentSidebar must be used within AgentSidebarProvider")
  return ctx
}


