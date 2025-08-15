"use client"

import type * as React from "react"
import { Index } from "@@/__registry__"
import { ChevronRightIcon, Home, FileText, PanelsTopLeft, Bot, ShoppingBag, CreditCard, UserRound, LayoutDashboard, Component, ShieldCheck, GalleryVerticalEnd, AudioWaveform, Command } from "lucide-react"
import { useTranslations } from "@/providers/translations-context"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "@/registry/new-york-v4/blocks/sidebar-07/components/nav-user"
import { TeamSwitcher } from "@/registry/new-york-v4/blocks/sidebar-07/components/team-switcher"
import type { SidebarGroupItem, IconName } from "@/config/sidebar"
import { Search } from "lucide-react"
import { WalletBalance } from "@/components/wallet-balance"

type Props = React.ComponentProps<typeof Sidebar> & {
  navMain: SidebarGroupItem[]
  user: { name?: string | null; email?: string | null; avatar?: string | null }
  recentStories?: { id: string; title: string }[]
}

const components = Object.values(Index)
  .filter((item) => item.type === "registry:ui")
  .concat([{ name: "combobox" } as any])
  .sort((a, b) => a.name.localeCompare(b.name))

export function AppSidebarClient({ navMain, user, recentStories = [], ...props }: Props) {
  const { t } = useTranslations()
  let insideProvider = true
  try {
    useSidebar()
  } catch {
    insideProvider = false
  }

  const SidebarContentComponent = () => (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
            { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
            { name: "Evil Corp.", logo: Command, plan: "Free" },
          ]}
        />
        <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <form className="relative">
              <Label htmlFor="search" className="sr-only">
                {t('sidebar.search')}
              </Label>
              <SidebarInput id="search" placeholder={t('sidebar.search')} className="pl-8" />
              <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
            </form>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.navigation')}</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => (
              <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && renderIcon(item.icon)}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{t('sidebar.recentStories')}</SidebarGroupLabel>
          <SidebarMenu>
            {recentStories.map((story) => (
              <SidebarMenuItem key={story.id}>
                <SidebarMenuButton asChild>
                  <a href={`/stories/${story.id}`}>
                    <span>{story.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
        <WalletBalance />
      </SidebarGroup>
      <SidebarFooter>
        <NavUser user={{
          name: user.name || "",
          email: user.email || "",
          avatar: user.avatar || "/avatars/shadcn.jpg",
        }} />
      </SidebarFooter>
      <SidebarRail className="transition-all duration-300 ease-in-out" />
    </Sidebar>
  )

  return insideProvider ? (
    <SidebarContentComponent />
  ) : (
    <SidebarProvider defaultOpen={true}>
      <SidebarContentComponent />
    </SidebarProvider>
  )
}

function getComponentName(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function renderIcon(name: IconName) {
  switch (name) {
    case "home":
      return <Home />
    case "fileText":
      return <FileText />
    case "panelsTopLeft":
      return <PanelsTopLeft />
    case "bot":
      return <Bot />
    case "shoppingBag":
      return <ShoppingBag />
    case "creditCard":
      return <CreditCard />
    case "userRound":
      return <UserRound />
    case "layoutDashboard":
      return <LayoutDashboard />
    case "component":
      return <Component />
    case "shieldCheck":
      return <ShieldCheck />
    default:
      return null
  }
}


