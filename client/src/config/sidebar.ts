import type { Session } from "next-auth"
import { getRecentStories } from "@/lib/navigation"
import { ru } from "@/lib/translations/ru"
import { en } from "@/lib/translations/en"
import { es } from "@/lib/translations/es"
import { fr } from "@/lib/translations/fr"
import { zh } from "@/lib/translations/zh"
import { uk } from "@/lib/translations/uk"

const translations = { ru, en, es, fr, zh, uk }

export type IconName =
  | "home"
  | "fileText"
  | "panelsTopLeft"
  | "bot"
  | "shoppingBag"
  | "creditCard"
  | "userRound"
  | "layoutDashboard"
  | "component"
  | "shieldCheck"

export interface SidebarLinkItem {
  title: string
  url: string
}

export interface SidebarGroupItem {
  title: string
  url?: string
  icon?: IconName
  isActive?: boolean
  items?: SidebarLinkItem[]
}

export async function buildSidebarNav(session?: Session | null, locale: string = 'en'): Promise<SidebarGroupItem[]> {
  const isAdmin = (session?.user as any)?.role === "ADMIN"
  
  // Безопасное получение переводов с fallback
  const validLocale = ['en', 'ru', 'es', 'fr', 'zh', 'uk'].includes(locale) ? locale : 'en'
  const t = translations[validLocale as keyof typeof translations] || translations.en
  
  // Проверяем, что переводы меню существуют
  if (!t || !t.menu) {
    console.error(`Menu translations not found for locale: ${validLocale}`)
    
    // Используем переводы en как fallback
    const fallbackT = translations.en
    if (!fallbackT || !fallbackT.menu) {
      throw new Error('Critical error: English translations not found')
    }
    
    // Возвращаем результат с fallback переводами
    return buildSidebarItems(fallbackT, isAdmin, await getRecentStories(), session)
  }
  
  return buildSidebarItems(t, isAdmin, await getRecentStories(), session)
}

function buildSidebarItems(t: any, isAdmin: boolean, recentStories: any[], session?: Session | null): SidebarGroupItem[] {
  return [
    {
      title: t.menu.home,
      url: "/",
      icon: "home",
      items: [
        { title: t.menu.myStories, url: "/" },
        { title: t.menu.allStories, url: "/stories" },
      ],
    },
    {
      title: t.menu.editor,
      icon: "fileText",
      items: [
        { title: t.menu.newStory, url: "/editor/new" },
        // Динамическая: список историй рендерится на главной
      ],
    },
    {
      title: t.menu.presentations,
      icon: "panelsTopLeft",
      items: [
        // Навигация к конкретной презентации производится из редактора/списка
        { title: t.menu.uiDemo, url: "/ui" },
      ],
    },
    {
      title: t.menu.projects,
      icon: "fileText",
      items: [
        { title: t.menu.myProjects, url: "/projects" },
        { title: t.menu.newProject, url: "/projects/new" },
      ],
    },
    {
      title: t.menu.agent,
      icon: "bot",
      items: [
        { title: t.menu.agentInterface, url: "/agent" },
        { title: t.menu.sessionLogs, url: "/agent-logs" },
      ],
    },
    {
      title: t.menu.products,
      icon: "shoppingBag",
      items: [
        { title: t.menu.catalog, url: "/products" },
      ],
    },
    {
      title: t.menu.payments,
      icon: "creditCard",
      items: [
        { title: t.menu.paymentHistory, url: "/account/payments" },
      ],
    },
    {
      title: t.menu.account,
      icon: "userRound",
      items: [
        { title: t.menu.profile, url: "/account" },
      ],
    },
    // Для неавторизованных показываем ссылки на вход/регистрацию
    ...(!session?.user
      ? [
          {
            title: t.menu.authentication,
            icon: "shieldCheck",
            items: [
              { title: t.menu.signin, url: "/signin" },
              { title: t.menu.signup, url: "/signup" },
            ],
          } as SidebarGroupItem,
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: t.menu.admin,
            icon: "layoutDashboard",
            items: [
              { title: t.menu.goods, url: "/admin/products" },
              { title: t.menu.dashboard, url: "/dashboard" },
              { title: t.menu.customers, url: "/dashboard/customers" },
              { title: t.menu.settings, url: "/dashboard/settings" },
            ],
          } as SidebarGroupItem,
        ]
      : []),

  ]
}


