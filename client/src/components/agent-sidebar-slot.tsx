"use client"

import dynamic from "next/dynamic"
import { useAgentSidebar } from "@/providers/agent-sidebar-context"
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable"

const AgentBroadcastPanel = dynamic(
  () => import("@/components/agent-broadcast-panel").then((m) => m.AgentBroadcastPanel),
  { ssr: false }
)

export function AgentSidebarSlot(): JSX.Element | null {
  const { isVisible, sidebarSize, setSidebarSize } = useAgentSidebar()
  
  if (!isVisible) return null
  
  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={sidebarSize}
        minSize={15}
        maxSize={50}
        onResize={(size) => {
          if (typeof size === "number") setSidebarSize(size)
        }}
      >
        <div className="h-full w-full border-l">
          <AgentBroadcastPanel />
        </div>
      </ResizablePanel>
    </>
  )
}
