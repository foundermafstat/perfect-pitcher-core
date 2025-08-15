"use client"

import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { useAgentSidebar } from "@/providers/agent-sidebar-context"

export function AgentSidebarToggleButton(): JSX.Element {
  const { toggle } = useAgentSidebar()
  return (
    <Button variant="outline" size="icon" onClick={toggle} title="AI">
      <Bot className="h-4 w-4" />
      <span className="sr-only">Toggle AI panel</span>
    </Button>
  )
}


