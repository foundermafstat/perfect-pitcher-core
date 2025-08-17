"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Fullscreen, Home } from "lucide-react"
import { toast } from "sonner"
import {
  EffectFade,
  Keyboard,
  Navigation,
  Pagination,
  Parallax,
} from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { useStory } from "@/lib/StoryContext"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SlideViewer } from "@/components/slide-viewer"
import { getStoryById } from "@/actions/slide"
import useWebRTCAudioSession from "@/hooks/use-webrtc"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"
import "swiper/css/parallax"

export default function PresentationPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string

  const { state, dispatch } = useStory()
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isControlsVisible, setIsControlsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { sendSlideContextUpdate, isSessionActive } = useWebRTCAudioSession(
    state.selectedVoice,
    [],
    state.currentStory
  )

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
          toast.error("История не найдена")
          router.push("/")
        }
      } catch (error) {
        console.error("Ошибка при загрузке истории:", error)
        toast.error("Ошибка при загрузке истории")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    loadStory()
  }, [storyId, dispatch, router])

  const handleSlideChange = (swiper: any) => {
    const newIndex = swiper.activeIndex
    setActiveSlideIndex(newIndex)
    dispatch({ type: "SET_CURRENT_SLIDE_INDEX", payload: newIndex })

    // If a session is active, send the new slide's context to the agent
    if (isSessionActive && state.currentStory?.slides[newIndex]?.context) {
      sendSlideContextUpdate(state.currentStory.slides[newIndex].context!)
    }
  }

  const returnToMainPage = () => {
    router.push("/")
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  if (isLoading || !state.currentStory) {
    return (
      <div className="flex h-screen items-center justify-center">
        Загрузка...
      </div>
    )
  }

  return (
    <div
      className="bg-background relative h-full w-full overflow-hidden"
      onMouseMove={() => setIsControlsVisible(true)}
      onMouseLeave={() => setIsControlsVisible(false)}
      style={{ maxHeight: "100%", maxWidth: "100%" }}
    >
      <Swiper
        modules={[Navigation, Pagination, Keyboard, EffectFade, Parallax]}
        spaceBetween={0} // Reduce space between slides
        effect={"fade"}
        speed={300} // Reduce transition speed
        parallax={true}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        onSlideChange={handleSlideChange}
        className="h-full w-full"
      >
        {state.currentStory.slides.map((slide, index) => (
          <SwiperSlide
            key={slide.id}
            className="bg-transparent flex items-center justify-center"
          >
            <SlideViewer
              slide={slide}
              useParallax={true}
              isActive={index === activeSlideIndex}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {isControlsVisible && (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={returnToMainPage}
            className="bg-background/20 hover:bg-background/40 text-foreground"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullScreen}
            className="bg-background/20 hover:bg-background/40 text-foreground"
          >
            <Fullscreen className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
