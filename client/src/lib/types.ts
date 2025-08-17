export interface Story {
  id: string
  title: string
  description: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
  userId?: string
  slides: Slide[]
  // optional extended fields stored in DB
  deckType?: string
  locale?: string
  brandColor?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  finalDataEn?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  qaLocalized?: any
}

export interface Slide {
  id: string
  title: string
  context?: string
  elements: SlideElement[]
  background: string
  backgroundType?: "none" | "color" | "gradient" | "youtube"
  gradientStart?: string
  gradientEnd?: string
  gradientAngle?: number
  youtubeBackground?: string
}

export interface SlideElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  rotate?: number
  content: any
  style: any
  animation?: Animation
  selected?: boolean // Add this line
  // Для фигур: заливка может быть цветом (rgba|string), градиентом или изображением
  fill?: string | GradientFill | { type: 'image'; src: string; fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' }
  // Параметры обводки
  stroke?: {
    width?: number
    color?: string // rgba/hex
  }
  // 3D-позиционирование элемента
  transform3d?: {
    rotateX?: number // deg
    rotateY?: number // deg
    rotateZ?: number // deg
    translateZ?: number // px
    perspective?: number // px
  }
}

export interface Blueprint {
  id: string
  name: string
  type: string
  category: string
  defaultWidth?: number
  defaultHeight?: number
  defaultContent?: any
  defaultStyle?: any
  // Optional defaults for shapes
  fill?: string | GradientFill | { type: 'image'; src: string; fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' }
  stroke?: { width?: number; color?: string }
}

export interface Animation {
  type: string
  duration: number
  delay: number
  easing: string
  repeat: boolean
}

export interface ShapeElement extends SlideElement {
  type: "rectangle" | "oval"
  fill: string | GradientFill
}

export interface GradientFill {
  type: "linear" | "radial"
  colors: string[]
  stops: number[]
  angle?: number // for linear gradients
}

export interface TextElement extends SlideElement {
  type: "text"
  content: string
}

export interface ImageElement extends SlideElement {
  type: "image"
  src: string
}

export interface ChartElement extends SlideElement {
  type: "chart"
  chartData: any
  chartOptions: any
}

export interface TableElement extends SlideElement {
  type: "table"
  tableData: any[][]
}

// Update the SlideElement type to include ShapeElement
export type SlideElementType = TextElement | ImageElement | ChartElement | TableElement | ShapeElement

