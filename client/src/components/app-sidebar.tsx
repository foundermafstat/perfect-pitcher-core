import { auth } from "@/auth"
import { buildSidebarNav } from "@/config/sidebar"
import { getRecentStories } from "@/lib/navigation"
import { AppSidebarClient } from "./app-sidebar.client"
import type * as React from "react"

type SidebarProps = Omit<React.ComponentProps<typeof AppSidebarClient>, "navMain" | "user" | "recentStories">

export async function AppSidebar(props: SidebarProps) {
  const session = await auth()
  const navMain = await buildSidebarNav(session)
  const recentStories = await getRecentStories()

  const user = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: "/avatars/shadcn.jpg",
  }

  return <AppSidebarClient {...props} navMain={navMain} user={user} recentStories={recentStories} />
}
