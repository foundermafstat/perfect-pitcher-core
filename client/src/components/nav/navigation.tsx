import * as React from "react"
import Link from "next/link"
import type { NavItem } from "@/types"

import { cn } from "@/lib/utils"
import { useTranslations } from "@/providers/translations-context"
import { getNavigationItemsWithStories } from "@/lib/navigation"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

interface NavigationProps {
  navItems?: NavItem[]
}

export async function Navigation({ navItems }: NavigationProps): Promise<JSX.Element> {
  // Получаем навигационные элементы с последними историями на сервере
  const items = navItems || await getNavigationItemsWithStories('ru') // По умолчанию русский язык
  
  return (
    <NavigationMenu className="hidden transition-all duration-300 ease-in-out md:flex">
      <NavigationMenuList>
        {items.map((item, index) => (
          <NavigationMenuItem key={`${item.title}-${index}`} asChild>
            <Link href={item.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              >
                {item.title}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
