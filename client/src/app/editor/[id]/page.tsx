"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  createSlide,
  getStoryById,
  updateFullSlide,
  updateSlideElements,
  updateStory,
  reorderSlides,
} from "@/actions/slide"
import { Play, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useStory } from "@/lib/StoryContext"
import { useTranslations } from "@/providers/translations-context"
import type { Blueprint, Slide } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { EditorCanvas } from "@/components/editor-canvas"
import { StoryTimeline } from "@/components/story-timeline"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSlideRef = useRef<Slide | null>(null)

  const { state, dispatch } = useStory()
  const { currentStory, currentSlideIndex } = state
  const { t } = useTranslations()

  // Загружаем историю из базы данных
  useEffect(() => {
    const loadStory = async () => {
      try {
        setIsLoading(true)
        const story = await getStoryById(storyId)
        if (story) {
          dispatch({ type: "SET_CURRENT_STORY", payload: story })
        } else {
          // История не найдена
          toast.error(t('editor.storyNotFound'))
          router.push("/")
        }
      } catch (error) {
        console.error("Ошибка при загрузке истории:", error)
        toast.error(t('editor.loadingError'))
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [storyId, dispatch, router])

  const handleAddSlide = async () => {
    if (!currentStory) return

    setIsSaving(true)
    try {
      const newSlide: Omit<Slide, "id"> = {
        title: t('editor.newSlide'),
        elements: [],
        background: "#ffffff",
        backgroundType: "color",
        youtubeBackground: "",
        gradientStart: "",
        gradientEnd: "",
        gradientAngle: 45,
      }

      // Создаем новый слайд в базе данных
      const createdSlide = await createSlide(currentStory.id, newSlide)
      if (createdSlide) {
        // Обновляем состояние
        const updatedStory = {
          ...currentStory,
          slides: [...currentStory.slides, createdSlide],
        }

        dispatch({ type: "SET_CURRENT_STORY", payload: updatedStory })
        dispatch({
          type: "SET_CURRENT_SLIDE_INDEX",
          payload: updatedStory.slides.length - 1,
        })
        toast.success(t('editor.slideAdded'))
      }
    } catch (error) {
      console.error("Ошибка при добавлении слайда:", error)
      toast.error(t('editor.addSlideError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveStory = async () => {
    if (!currentStory) return

    setIsSaving(true)
    try {
      // Обновляем основную информацию о истории
      await updateStory(currentStory.id, {
        title: currentStory.title,
        description: currentStory.description,
        thumbnail: currentStory.thumbnail,
      })

      toast.success(t('editor.storySaved'))
    } catch (error) {
      console.error("Ошибка при сохранении истории:", error)
      toast.error(t('editor.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStory = async () => {
    if (!currentStory) return
    if (!confirm(t('editor.deleteConfirm'))) return
    const { deleteStory } = await import('@/actions/slide')
    const ok = await deleteStory(currentStory.id)
    if (ok) {
      toast.success(t('editor.storyDeleted'))
      router.push('/editor/new')
    } else {
      toast.error(t('editor.deleteError'))
    }
  }

  const handleAddElement = (blueprint: Blueprint) => {
    if (!currentStory) return

    const newElement = {
      id: `element-${Date.now()}`,
      type: blueprint.type,
      x: 100,
      y: 100,
      width: blueprint.defaultWidth || 200,
      height: blueprint.defaultHeight || 100,
      content: blueprint.defaultContent || {},
      style: blueprint.defaultStyle || {},
    }

    const updatedSlide = {
      ...currentStory.slides[currentSlideIndex],
      elements: [
        ...currentStory.slides[currentSlideIndex].elements,
        newElement,
      ],
    }

    handleSlideUpdate(updatedSlide)
  }

  // Функция для сохранения изменений слайда с задержкой
  const saveSlideChanges = async (slide: Slide) => {
    try {
      // Используем updateFullSlide вместо updateSlideElements для сохранения всех данных слайда, включая фон
      await updateFullSlide(slide.id, {
        title: slide.title,
        background: slide.background,
        backgroundType: slide.backgroundType,
        youtubeBackground: slide.youtubeBackground,
        gradientStart: slide.gradientStart,
        gradientEnd: slide.gradientEnd,
        gradientAngle: slide.gradientAngle,
        elements: slide.elements,
      })
      console.log(
        "Сохранен слайд с типом фона:",
        slide.backgroundType,
        "YouTube:",
        slide.youtubeBackground,
        "Градиент:",
        slide.gradientStart,
        slide.gradientEnd
      )
    } catch (error) {
      console.error("Ошибка при обновлении слайда:", error)
      toast.error(t('editor.saveChangesError'))
    }
  }

  // Функция для обработки изменений слайда с дебаунсом
  const handleSlideUpdate = (updatedSlide: Slide) => {
    if (!currentStory) return

    // Обновляем состояние в UI для мгновенной обратной связи
    dispatch({
      type: "UPDATE_SLIDE",
      payload: {
        storyId: currentStory.id,
        slideIndex: currentSlideIndex,
        updatedSlide,
      },
    })

    // Сохраняем последнее состояние слайда
    pendingSlideRef.current = updatedSlide

    // Отменяем предыдущий таймер сохранения, если он существует
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Устанавливаем новый таймер для сохранения изменений через 1 секунду
    saveTimeoutRef.current = setTimeout(() => {
      if (pendingSlideRef.current) {
        saveSlideChanges(pendingSlideRef.current)
        pendingSlideRef.current = null
      }
    }, 1000) // Задержка в 1 секунду
  }

  if (isLoading || !currentStory) {
    return (
      <div className="flex h-full items-center justify-center">{t('editor.loading')}</div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-58px)] items-center justify-center relative">
      <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b px-4 py-2">
          <div>
            <h1 className="text-lg font-semibold">{currentStory.title}</h1>
            <p className="text-muted-foreground text-xs">
              {currentStory.description}
            </p>
            {currentStory.brandColor ? (
              <div className="mt-1 h-1 w-24 rounded" style={{ background: (currentStory as any).brandColor }} />
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddSlide}
              disabled={isSaving}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t('editor.slide')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveStory}
              disabled={isSaving}
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {t('editor.save')}
            </Button>
            <Button size="sm" asChild>
              <a
                href={`/presentation/${currentStory.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play className="mr-1 h-3.5 w-3.5" />
                {t('editor.presentation')}
              </a>
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteStory}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {t('editor.delete')}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <EditorCanvas
                slide={currentStory.slides[currentSlideIndex]}
                onChange={handleSlideUpdate}
              />
            </div>

            {/* Таймлайн слайдов - фиксированный внизу с минимальной высотой */}
            <div className="sticky bottom-0 min-h-[96px]">
              <StoryTimeline
                slides={currentStory.slides}
                currentIndex={currentSlideIndex}
                onSelectSlide={(index) =>
                  dispatch({ type: "SET_CURRENT_SLIDE_INDEX", payload: index })
                }
                onAddSlide={handleAddSlide}
                onReorderSlides={async (reordered) => {
                  // Обновляем состояние локально
                  const prevSlideId = currentStory.slides[currentSlideIndex]?.id
                  const updatedStory = { ...currentStory, slides: reordered }
                  dispatch({ type: "SET_CURRENT_STORY", payload: updatedStory })
                  // Пересчитываем индекс текущего
                  const newIndex = reordered.findIndex(s => s.id === prevSlideId)
                  if (newIndex >= 0) {
                    dispatch({ type: "SET_CURRENT_SLIDE_INDEX", payload: newIndex })
                  }

                  // Пытаемся сохранить порядок на сервере
                  try {
                    const ok = await reorderSlides(currentStory.id, reordered.map(s => s.id))
                    if (!ok) throw new Error('Server rejected')
                  } catch (e) {
                    toast.error(t('editor.reorderError'))
                  }
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
