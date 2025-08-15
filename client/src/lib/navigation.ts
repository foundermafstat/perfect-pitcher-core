import type { MainNavItem, SidebarNavItem } from "@/types"
import { getTranslation } from "@/lib/translations"
import { prisma } from "@/config/db"

// Функция для получения последних 3 историй
export async function getRecentStories(): Promise<{ id: string; title: string }[]> {
  try {
    const stories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    })
    
    return stories
  } catch (error) {
    console.error('Ошибка при получении последних историй:', error)
    return []
  }
}

export function getNavigationItems(locale: string = 'en'): MainNavItem[] {
  const t = getTranslation(locale)
  
  return [
    {
      title: t.navigation.home,
      href: "/",
    },
    {
      title: t.navigation.myStories,
      href: "/my-stories",
    },
    {
      title: t.navigation.allStories,
      href: "/stories",
    },
    {
      title: t.navigation.projects,
      href: "/projects",
    },
    {
      title: t.navigation.products,
      href: "/products",
    },
  ]
}

// Функция для получения навигационных элементов с последними историями
export async function getNavigationItemsWithStories(locale: string = 'en'): Promise<MainNavItem[]> {
  const t = getTranslation(locale)
  const recentStories = await getRecentStories()
  
  const baseItems = getNavigationItems(locale)
  
  // Добавляем последние истории после основных пунктов меню
  const storyItems: MainNavItem[] = recentStories.map(story => ({
    title: story.title,
    href: `/stories/${story.id}`,
  }))
  
  return [...baseItems, ...storyItems]
}

export function getFooterNavigationItems(locale: string = 'en'): SidebarNavItem[] {
  const t = getTranslation(locale)
  
  return [
    {
      title: t.navigation.footer.product,
      href: "#",
      items: [
        {
          title: t.navigation.footer.stories,
          href: "/stories",
          items: []
        },
        {
          title: t.navigation.projects,
          href: "/projects",
          items: []
        },
        {
          title: t.navigation.footer.editor,
          href: "/editor/new",
          items: []
        },
      ],
    },
    {
      title: t.navigation.footer.support,
      href: "#",
      items: [
        {
          title: t.navigation.footer.account,
          href: "/account",
          items: []
        },
        {
          title: t.navigation.footer.help,
          href: "/help",
          items: []
        },
      ],
    },
    {
      title: t.navigation.footer.company,
      href: "#",
      items: [
        {
          title: t.navigation.footer.about,
          href: "/about",
          items: []
        },
        {
          title: t.navigation.footer.contact,
          href: "/contact",
          items: []
        },
      ],
    },
  ]
}
