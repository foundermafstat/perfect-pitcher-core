import type { Session } from "next-auth"
import { getRecentStories } from "@/lib/navigation"

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

export async function buildSidebarNav(session?: Session | null): Promise<SidebarGroupItem[]> {
  const isAdmin = (session?.user as any)?.role === "ADMIN"
  
  // Получаем последние истории
  const recentStories = await getRecentStories()

  return [
    {
      title: "Главная",
      url: "/",
      icon: "home",
      items: [
        { title: "Мои истории", url: "/" },
        { title: "Все истории", url: "/stories" },
      ],
    },
    {
      title: "Редактор",
      icon: "fileText",
      items: [
        { title: "Новая история", url: "/editor/new" },
        // Динамическая: список историй рендерится на главной
      ],
    },
    {
      title: "Презентации",
      icon: "panelsTopLeft",
      items: [
        // Навигация к конкретной презентации производится из редактора/списка
        { title: "UI Демо", url: "/ui" },
      ],
    },
    {
      title: "Проекты",
      icon: "fileText",
      items: [
        { title: "Мои проекты", url: "/projects" },
        { title: "Новый проект", url: "/projects/new" },
      ],
    },
    {
      title: "Агент",
      icon: "bot",
      items: [
        { title: "Интерфейс агента", url: "/agent" },
        { title: "Логи сессий", url: "/agent-logs" },
      ],
    },
    {
      title: "Продукты",
      icon: "shoppingBag",
      items: [
        { title: "Каталог", url: "/products" },
      ],
    },
    {
      title: "Платежи",
      icon: "creditCard",
      items: [
        { title: "История платежей", url: "/account/payments" },
      ],
    },
    {
      title: "Аккаунт",
      icon: "userRound",
      items: [
        { title: "Профиль", url: "/account" },
      ],
    },
    // Для неавторизованных показываем ссылки на вход/регистрацию
    ...(!session?.user
      ? [
          {
            title: "Аутентификация",
            icon: "shieldCheck",
            items: [
              { title: "Войти", url: "/signin" },
              { title: "Регистрация", url: "/signup" },
            ],
          } as SidebarGroupItem,
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "Админ",
            icon: "layoutDashboard",
            items: [
              { title: "Товары", url: "/admin/products" },
              { title: "Дэшборд (пример)", url: "/dashboard" },
              { title: "Покупатели (пример)", url: "/dashboard/customers" },
              { title: "Настройки (пример)", url: "/dashboard/settings" },
            ],
          } as SidebarGroupItem,
        ]
      : []),

  ]
}


