"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { type Slide, getSlides } from "@/lib/airine-data"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/providers/translations-context"

// Интерфейс Slide импортирован из /lib/airine-data

// Интерфейс для компонента SlideCard
interface SlideCardProps {
  slides?: Slide[]
  currentSlide?: number
  onSlideChange?: (index: number) => void
}

export function SlideCard({
  slides: propSlides,
  currentSlide: propCurrentSlide,
  onSlideChange,
}: SlideCardProps) {
  const { t } = useTranslations()
  const [currentSlide, setCurrentSlide] = useState(propCurrentSlide || 0)
  const [direction, setDirection] = useState(0)

  // Получаем слайды из нашего центрального хранилища данных, если они не переданы через пропсы
  const { locale } = t
  const defaultSlides = getSlides(locale)
  const slides = propSlides || defaultSlides

  // Обновляем внутреннее состояние, когда меняются пропсы
  useEffect(() => {
    if (propCurrentSlide !== undefined) {
      setCurrentSlide(propCurrentSlide)
    }
  }, [propCurrentSlide])

  // Варианты анимации
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  }

  // Функция для перехода к следующему слайду
  const nextSlide = () => {
    setDirection(1)
    const newSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1
    setCurrentSlide(newSlide)
    if (onSlideChange) onSlideChange(newSlide)
  }

  // Функция для перехода к предыдущему слайду
  const prevSlide = () => {
    setDirection(-1)
    const newSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1
    setCurrentSlide(newSlide)
    if (onSlideChange) onSlideChange(newSlide)
  }

  // Функция для перехода к конкретному слайду
  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
    if (onSlideChange) onSlideChange(index)
  }

  return (
    <motion.div
      className="bg-card w-full overflow-hidden rounded-3xl border shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="relative h-[400px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col justify-between p-6"
          >
            {slides[currentSlide].imageUrl && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={slides[currentSlide].imageUrl ?? ""}
                  alt={slides[currentSlide].title}
                  className="h-full w-full object-cover opacity-20"
                  fill
                  priority
                />
              </div>
            )}
            <div className="z-10 space-y-4">
              <motion.h2
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-pt-sans-narrow)" }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                className="text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {slides[currentSlide].content}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Навигация слайдов */}
        <div className="absolute right-6 bottom-6 z-20 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-foreground rounded-full hover:text-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-foreground rounded-full hover:text-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Индикаторы слайдов */}
        <div className="absolute bottom-6 left-6 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-foreground"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Создаем слайды на основе данных из airine-data
export const createDemoSlides = (t: { locale: string } | ((key: string, variables?: Record<string, string | number>) => string)): Slide[] => {
  // t может быть объектом с полем locale (наш контекст переводов)
  // или функцией переводов. В последнем случае используем локаль по умолчанию 'en'.
  const locale = typeof t === "function" ? "en" : t.locale
  return getSlides(locale)
}
