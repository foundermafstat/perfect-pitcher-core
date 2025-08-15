"use client"

import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import { useAgentSidebar } from "@/providers/agent-sidebar-context"
import { useTranslations } from "@/providers/translations-context"

export function AgentSidebarToggleButton(): JSX.Element {
  const { toggle } = useAgentSidebar()
  const { t } = useTranslations()
  return (
    <Button variant="outline" size="icon" onClick={toggle} title={t('agent.togglePanel')}>
      <Bot className="h-4 w-4" />
      <span className="sr-only">{t('agent.togglePanel')}</span>
    </Button>
  )
}


