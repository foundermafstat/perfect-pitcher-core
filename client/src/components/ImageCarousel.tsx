"use client"

import type React from "react"
import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

interface ImageCarouselProps {
  images: string[]
  autoplaySpeed?: number
  loop?: boolean
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, autoplaySpeed = 3000, loop = true }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={30}
        effect={"fade"}
        navigation
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
        autoplay={{
          delay: autoplaySpeed,
          disableOnInteraction: false,
        }}
        loop={loop}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="mySwiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img src={image || "/placeholder.svg"} alt={`Slide ${index + 1}`} className="w-full h-64 object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
        {activeIndex + 1} / {images.length}
      </div>
    </div>
  )
}

export default ImageCarousel

