'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import type { Story, Slide, SlideElement } from '@/lib/types'

// Helper function to restore element properties from style
function restoreElementFromDB(dbElement: any): SlideElement {
  const style = dbElement.style || {}
  const { fill, stroke, transform3d, ...cleanStyle } = style
  
  return {
    id: dbElement.id,
    type: dbElement.type,
    x: dbElement.x,
    y: dbElement.y,
    width: dbElement.width,
    height: dbElement.height,
    content: dbElement.content as any,
    style: cleanStyle,
    // Восстанавливаем специальные свойства из style
    ...(fill ? { fill } : {}),
    ...(stroke ? { stroke } : {}),
    ...(transform3d ? { transform3d } : {})
  }
}

// Входные типы для создания сущностей без id
type CreateSlideElementInput = Omit<SlideElement, 'id'>
type CreateSlideInput = Omit<Slide, 'id' | 'elements'> & { elements: CreateSlideElementInput[] }
export type CreateStoryInput = Omit<Story, 'id' | 'createdAt' | 'updatedAt' | 'slides'> & { slides: CreateSlideInput[] }

type BackgroundType = 'none' | 'color' | 'gradient' | 'youtube'

function toBackgroundType(value?: string | null): BackgroundType {
  switch (value) {
    case 'none':
    case 'color':
    case 'gradient':
    case 'youtube':
      return value
    default:
      return 'color'
  }
}

// Получить все истории (для админов или общего доступа)
export async function getStories(): Promise<Story[]> {
  try {
    const stories = await prisma.story.findMany({
      include: {
        slides: {
          include: {
            elements: true
          },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Преобразуем данные из базы в формат, соответствующий нашим типам
    return stories.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      thumbnail: story.thumbnail || '',
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      userId: story.userId || undefined,
      slides: story.slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        context: (slide as any).context || '',
        background: slide.background,
        backgroundType: toBackgroundType((slide as any).backgroundType),
        youtubeBackground: (slide as any).youtubeBackground || '',
        gradientStart: (slide as any).gradientStart || '',
        gradientEnd: (slide as any).gradientEnd || '',
        gradientAngle: (slide as any).gradientAngle ?? 45,
        elements: slide.elements.map(element => restoreElementFromDB(element))
      }))
    }))
  } catch (error) {
    console.error('Ошибка при получении историй:', error)
    return []
  }
}

// Получить истории текущего пользователя
export async function getUserStories(): Promise<Story[]> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const stories = await prisma.story.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        slides: {
          include: {
            elements: true
          },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Преобразуем данные из базы в формат, соответствующий нашим типам
    return stories.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      thumbnail: story.thumbnail || '',
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      userId: story.userId || undefined,
      slides: story.slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        context: (slide as any).context || '',
        background: slide.background,
        backgroundType: toBackgroundType((slide as any).backgroundType),
        youtubeBackground: slide.youtubeBackground || '',
        gradientStart: slide.gradientStart || '',
        gradientEnd: slide.gradientEnd || '',
        gradientAngle: slide.gradientAngle || 45,
        elements: slide.elements.map(element => restoreElementFromDB(element))
      }))
    }))
  } catch (error) {
    console.error('Ошибка при получении историй пользователя:', error)
    return []
  }
}

export async function getStoryById(id: string): Promise<Story | null> {
  try {
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        slides: {
          include: {
            elements: true
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    })

    if (!story) return null

    return {
      id: story.id,
      title: story.title,
      description: story.description,
      thumbnail: story.thumbnail || '',
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      userId: story.userId || undefined,
      slides: story.slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        context: (slide as any).context || '',
        background: slide.background,
        backgroundType: toBackgroundType(slide.backgroundType as any),
        youtubeBackground: slide.youtubeBackground || '',
        gradientStart: slide.gradientStart || '',
        gradientEnd: slide.gradientEnd || '',
        gradientAngle: slide.gradientAngle || 45,
        elements: slide.elements.map(element => restoreElementFromDB(element))
      }))
    }
  } catch (error) {
    console.error('Ошибка при получении истории:', error)
    return null
  }
}

export async function createStory(story: CreateStoryInput & { deckType?: string; locale?: string; brandColor?: string; finalDataEn?: any; qaLocalized?: any }): Promise<Story | null> {
  try {
    const session = await auth()
    const userId = session?.user?.id || null

    const newStory = await prisma.story.create({
      data: {
        title: story.title,
        description: story.description,
        thumbnail: story.thumbnail || '',
        userId: userId,
        deckType: (story as any).deckType ?? null,
        locale: (story as any).locale ?? null,
        brandColor: (story as any).brandColor ?? null,
        finalDataEn: (story as any).finalDataEn ?? undefined,
        qaLocalized: (story as any).qaLocalized ?? undefined,
        slides: {
          create: story.slides.map(slide => ({
            title: slide.title,
            context: slide.context || '',
            background: slide.background,
            elements: {
              create: slide.elements.map(element => ({
                type: element.type,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                content: element.content,
                style: element.style || {}
              }))
            }
          }))
        }
      },
      include: {
        slides: {
          include: {
            elements: true
          }
        }
      }
    })

    return {
      id: newStory.id,
      title: newStory.title,
      description: newStory.description,
      thumbnail: newStory.thumbnail,
      userId: newStory.userId || undefined,
      // @ts-expect-error extend runtime shape
      deckType: (newStory as any).deckType ?? undefined,
      // @ts-expect-error extend runtime shape
      locale: (newStory as any).locale ?? undefined,
      // @ts-expect-error extend runtime shape
      brandColor: (newStory as any).brandColor ?? undefined,
      // @ts-expect-error extend runtime shape
      finalDataEn: (newStory as any).finalDataEn ?? undefined,
      // @ts-expect-error extend runtime shape
      qaLocalized: (newStory as any).qaLocalized ?? undefined,
      createdAt: newStory.createdAt.toISOString(),
      updatedAt: newStory.updatedAt.toISOString(),
      slides: newStory.slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        context: (slide as any).context || '',
        background: slide.background,
        elements: slide.elements.map(element => restoreElementFromDB(element))
      }))
    }
  } catch (error) {
    console.error('Ошибка при создании истории:', error)
    return null
  }
}

export async function updateStory(id: string, storyData: Partial<Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Story | null> {
  try {
    const updatedStory = await prisma.story.update({
      where: { id },
      data: {
        title: storyData.title,
        description: storyData.description,
        thumbnail: storyData.thumbnail,
        // @ts-expect-error extend
        deckType: (storyData as any).deckType,
        // @ts-expect-error extend
        locale: (storyData as any).locale,
        // @ts-expect-error extend
        brandColor: (storyData as any).brandColor,
        // @ts-expect-error extend
        finalDataEn: (storyData as any).finalDataEn,
        // @ts-expect-error extend
        qaLocalized: (storyData as any).qaLocalized,
      },
      include: {
        slides: {
          include: {
            elements: true
          }
        }
      }
    })

    return {
      id: updatedStory.id,
      title: updatedStory.title,
      description: updatedStory.description,
      thumbnail: updatedStory.thumbnail,
      // @ts-expect-error extend
      deckType: (updatedStory as any).deckType,
      // @ts-expect-error extend
      locale: (updatedStory as any).locale,
      // @ts-expect-error extend
      brandColor: (updatedStory as any).brandColor,
      // @ts-expect-error extend
      finalDataEn: (updatedStory as any).finalDataEn,
      // @ts-expect-error extend
      qaLocalized: (updatedStory as any).qaLocalized,
      createdAt: updatedStory.createdAt.toISOString(),
      updatedAt: updatedStory.updatedAt.toISOString(),
      slides: updatedStory.slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        context: (slide as any).context || '',
        background: slide.background,
        elements: slide.elements.map(element => restoreElementFromDB(element))
      }))
    }
  } catch (error) {
    console.error('Ошибка при обновлении истории:', error)
    return null
  }
}

export async function createSlide(storyId: string, slide: Omit<Slide, 'id'>): Promise<Slide | null> {
  try {
    // Определяем позицию нового слайда как следующий индекс
    const slidesCount = await prisma.slide.count({ where: { storyId } })
    const newSlide = await prisma.slide.create({
      data: {
        title: slide.title,
        context: slide.context || '',
        background: slide.background,
        backgroundType: toBackgroundType(slide.backgroundType as any),
        youtubeBackground: slide.youtubeBackground || '',
        gradientStart: slide.gradientStart || '',
        gradientEnd: slide.gradientEnd || '',
        gradientAngle: slide.gradientAngle || 45,
        storyId: storyId,
        position: slidesCount,
        elements: {
          create: slide.elements.map(element => ({
            type: element.type,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            content: element.content,
            style: element.style || {}
          }))
        }
      },
      include: {
        elements: true
      }
    })

    return {
      id: newSlide.id,
      title: newSlide.title,
      context: (newSlide as any).context || '',
      background: newSlide.background,
      backgroundType: toBackgroundType(newSlide.backgroundType as any),
      youtubeBackground: newSlide.youtubeBackground || '',
      gradientStart: newSlide.gradientStart || '',
      gradientEnd: newSlide.gradientEnd || '',
      gradientAngle: newSlide.gradientAngle ?? 45,
      elements: newSlide.elements.map(element => ({
        id: element.id,
        type: element.type,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        content: element.content as any,
        style: element.style as any
      }))
    }
  } catch (error) {
    console.error('Ошибка при создании слайда:', error)
    return null
  }
}

export async function updateSlide(id: string, slideData: Partial<Omit<Slide, 'id'>>): Promise<Slide | null> {
  try {
    // Обновляем только основные данные слайда, без элементов
    const updatedSlide = await prisma.slide.update({
      where: { id },
      data: {
        title: slideData.title,
        context: slideData.context || '',
        background: slideData.background
      },
      include: {
        elements: true
      }
    })

    return {
      id: updatedSlide.id,
      title: updatedSlide.title,
      context: (updatedSlide as any).context || '',
      background: updatedSlide.background,
      elements: updatedSlide.elements.map(element => restoreElementFromDB(element))
    }
  } catch (error) {
    console.error('Ошибка при обновлении слайда:', error)
    return null
  }
}

export async function updateSlideElements(slideId: string, elements: SlideElement[]): Promise<Slide | null> {
  try {
    // Сначала удаляем все существующие элементы
    await prisma.element.deleteMany({
      where: { slideId }
    })

    // Затем создаем новые элементы
    await prisma.element.createMany({
      data: elements.map(element => ({
        slideId,
        type: element.type,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        content: element.content,
        style: {
          ...(element.style || {}),
          // Сохраняем fill в style если есть
          ...(element.fill ? { fill: element.fill } : {}),
          // Сохраняем stroke в style если есть
          ...(element.stroke ? { stroke: element.stroke } : {}),
          // Сохраняем transform3d в style если есть
          ...(element.transform3d ? { transform3d: element.transform3d } : {})
        }
      }))
    })

    // Получаем обновленный слайд с элементами
    const updatedSlide = await prisma.slide.findUnique({
      where: { id: slideId },
      include: {
        elements: true
      }
    })

    if (!updatedSlide) return null

    return {
      id: updatedSlide.id,
      title: updatedSlide.title,
      context: (updatedSlide as any).context || '',
      background: updatedSlide.background,
      elements: updatedSlide.elements.map(element => restoreElementFromDB(element))
    }
  } catch (error) {
    console.error('Ошибка при обновлении элементов слайда:', error)
    return null
  }
}

export async function updateFullSlide(slideId: string, slideData: Partial<Omit<Slide, 'id'>>): Promise<Slide | null> {
  try {
    // Обновляем основные данные слайда (фон, заголовок и все свойства фона)
    console.log('Обновляем слайд:', slideId, 'с данными:', slideData);
    
    await prisma.slide.update({
      where: { id: slideId },
      data: {
        title: slideData.title,
        context: slideData.context || '',
        background: slideData.background,
        backgroundType: slideData.backgroundType as any,
        youtubeBackground: slideData.youtubeBackground,
        gradientStart: slideData.gradientStart,
        gradientEnd: slideData.gradientEnd,
        gradientAngle: slideData.gradientAngle
      }
    })

    // Если есть элементы для обновления, обновляем их
    if (slideData.elements) {
      // Удаляем существующие элементы
      await prisma.element.deleteMany({
        where: { slideId }
      })

      // Создаем новые элементы
      await prisma.element.createMany({
        data: slideData.elements.map(element => ({
          slideId,
          type: element.type,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          content: element.content,
          style: {
            ...(element.style || {}),
            // Сохраняем fill в style если есть
            ...(element.fill ? { fill: element.fill } : {}),
            // Сохраняем stroke в style если есть
            ...(element.stroke ? { stroke: element.stroke } : {}),
            // Сохраняем transform3d в style если есть
            ...(element.transform3d ? { transform3d: element.transform3d } : {})
          }
        }))
      })
    }

    // Получаем обновленный слайд с элементами
    const updatedSlide = await prisma.slide.findUnique({
      where: { id: slideId },
      include: {
        elements: true
      }
    })

    if (!updatedSlide) return null

    return {
      id: updatedSlide.id,
      title: updatedSlide.title,
      context: (updatedSlide as any).context || '',
      background: updatedSlide.background,
      elements: updatedSlide.elements.map(element => restoreElementFromDB(element))
    }
  } catch (error) {
    console.error('Ошибка при обновлении слайда:', error)
    return null
  }
}

// Обновление порядка слайдов по их id (index в массиве = новая позиция)
export async function reorderSlides(storyId: string, orderedSlideIds: string[]): Promise<boolean> {
  try {
    await prisma.$transaction(
      orderedSlideIds.map((slideId, index) =>
        prisma.slide.update({
          where: { id: slideId },
          data: { position: index, storyId },
        })
      )
    )
    return true
  } catch (error) {
    console.error('Ошибка при изменении порядка слайдов:', error)
    return false
  }
}

export async function deleteStory(id: string): Promise<boolean> {
  try {
    await prisma.story.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error('Ошибка при удалении истории:', error)
    return false
  }
}
