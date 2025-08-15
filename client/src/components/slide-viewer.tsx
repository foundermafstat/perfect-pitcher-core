"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

import { renderElement } from "@/lib/element-renderer"
import type { Slide } from "@/lib/types"
import { Chart } from "@/components/ui/chart"

import { YoutubeBackground } from "./youtube-background"

interface SlideViewerProps {
  slide: Slide
  useParallax?: boolean
  isActive?: boolean
}

export function SlideViewer({
  slide,
  useParallax = false,
  isActive = false,
}: SlideViewerProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const slideRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (slideRef.current) {
        const rect = slideRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const extractYoutubeId = (url: string): string => {
    if (!url) return ""
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : ""
  }

  const getBackgroundStyle = (): React.CSSProperties => {
    // Проверяем тип фона и возвращаем соответствующий стиль
    console.log('Тип фона:', slide.backgroundType, 'YouTube:', slide.youtubeBackground, 'Градиент:', slide.gradientStart, slide.gradientEnd);
    
    if (slide.backgroundType === "gradient" && slide.gradientStart && slide.gradientEnd) {
      return {
        background: `linear-gradient(${slide.gradientAngle || 45}deg, ${slide.gradientStart}, ${slide.gradientEnd})`,
      }
    }

    if (slide.backgroundType === "youtube") {
      return {
        background: "black", // Fallback color for YouTube background
      }
    }

    if (slide.backgroundType === "none") {
      return {
        backgroundColor: "transparent",
      }
    }

    // Тип фона "color" или по умолчанию
    return {
      backgroundColor: slide.background || "#ffffff",
    }
  }

  const youtubeVideoId = slide.youtubeBackground
    ? extractYoutubeId(slide.youtubeBackground)
    : ""

  return (
    <div
      ref={slideRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        ...getBackgroundStyle(),
        perspective: "1000px",
      }}
      data-swiper-parallax-opacity={useParallax ? "0.4" : undefined}
      data-swiper-parallax-duration={useParallax ? "1000" : undefined}
    >
      {slide.backgroundType === "youtube" && youtubeVideoId && (
        <YoutubeBackground videoId={youtubeVideoId} isActive={isActive} />
      )}

      <div
        className="relative h-full max-h-[720px] w-full max-w-[1280px] transition-transform duration-200 ease-out"
        style={{
          transform: `rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
        }}
      >
        {slide.elements.map((element, index) => (
          <div
            key={element.id}
            className="absolute transition-transform duration-200 ease-out"
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
              width: `${element.width}px`,
              height: `${element.height}px`,
              zIndex: 10,
              transform: !useParallax
                ? `translateZ(${index * 10}px) translateX(${mousePosition.x * (index + 1) * 10}px) translateY(${
                    mousePosition.y * (index + 1) * 10
                  }px)`
                : undefined,
            }}
            data-swiper-parallax={
              useParallax ? `${-100 * (index + 1)}` : undefined
            }
            data-swiper-parallax-opacity={useParallax ? "0.2" : undefined}
            data-swiper-parallax-duration={useParallax ? "800" : undefined}
          >
            {element.type === "chart" ? (
              <Chart type={element.content.chartType} />
            ) : (
              renderElement(element)
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
