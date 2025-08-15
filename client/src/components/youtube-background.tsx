"use client"

import { useEffect, useRef, useState } from "react"

interface YoutubeBackgroundProps {
  videoId: string
  isActive: boolean
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function YoutubeBackground({ videoId, isActive }: YoutubeBackgroundProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [apiLoaded, setApiLoaded] = useState(false)

  // Загрузка YouTube API
  useEffect(() => {
    // Проверяем, загружен ли уже API
    if (window.YT) {
      setApiLoaded(true)
      return
    }

    // Создаем функцию обратного вызова
    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true)
    }

    // Загружаем API YouTube
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Очистка
    return () => {
      window.onYouTubeIframeAPIReady = () => {}
    }
  }, [])

  // Создаем URL для iframe
  const getYoutubeEmbedUrl = () => {
    const params = new URLSearchParams({
      autoplay: isActive ? "1" : "0",
      controls: "0",
      disablekb: "1",
      fs: "0",
      modestbranding: "1",
      rel: "0",
      showinfo: "0",
      mute: "1",
      loop: "1",
      playlist: videoId,
      playsinline: "1",
      enablejsapi: "1"
    })

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
  }

  // Обновляем src iframe при изменении активности
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = getYoutubeEmbedUrl()
    }
  }, [isActive, videoId])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-black/30 z-10" /> {/* Overlay для лучшей видимости контента */}
      <div className="w-full h-full scale-150"> {/* Увеличиваем для заполнения слайда */}
        <iframe
          ref={iframeRef}
          className="w-full h-full absolute inset-0"
          src={getYoutubeEmbedUrl()}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

