"use client"

import type * as React from "react"
import {
  ChartLineIcon,
  FileIcon,
  HomeIcon,
  LifeBuoy,
  Send,
  Settings2Icon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react"

import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"
import { NavMain } from "@/app/(examples)/dashboard/components/nav-main"
import { NavSecondary } from "@/app/(examples)/dashboard/components/nav-secondary"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HomeIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: ChartLineIcon,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: ShoppingBagIcon,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: ShoppingCartIcon,
    },
    {
      title: "Invoices",
      url: "/dashboard/invoices",
      icon: FileIcon,
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: UserIcon,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2Icon,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Проверяем наличие родительского SidebarProvider
  let insideProvider = true;
  try {
    // Если этот вызов не выбрасывает ошибку, значит мы внутри SidebarProvider
    const { useSidebar } = require("@/components/ui/sidebar");
    useSidebar();
  } catch (e) {
    insideProvider = false;
  }

  // Компонент для отображения содержимого сайдбара
  const SidebarContentComponent = () => (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );

  // Если мы не внутри SidebarProvider, оборачиваем в него
  return insideProvider ? <SidebarContentComponent /> : <SidebarProvider><SidebarContentComponent /></SidebarProvider>;
}
