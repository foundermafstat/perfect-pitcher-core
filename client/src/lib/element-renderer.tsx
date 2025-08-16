import type React from "react"
import { Image, Table } from "lucide-react"

import type { GradientFill, ShapeElement, SlideElement } from "@/lib/types"
import { Chart } from "@/components/ui/chart"

function getAnimationStyles(
  animation?: SlideElement["animation"]
): React.CSSProperties {
  if (!animation || !animation.type) return {}

  return {
    animation: `${animation.type} ${animation.duration}s ${animation.easing} ${animation.delay}s ${animation.repeat ? "infinite" : ""}`,
  }
}

export function renderElement(element: SlideElement, isPreview: boolean = false) {
  const animationStyles = getAnimationStyles(element.animation)

  switch (element.type) {
    case "text":
      return (
        <div
          className="h-full w-full overflow-hidden p-2"
          style={{
            ...element.style,
            ...animationStyles,
            fontSize: isPreview ? 'inherit' : (element.style.fontSize || "16px"),
            fontWeight: element.style.fontWeight || "normal",
            color: element.style.color || "#000000",
            textAlign: (element.style.textAlign as any) || "left",
            fontFamily: element.style.fontFamily || "inherit",
            lineHeight: isPreview ? '1.2' : '1.4',
            display: 'flex',
            alignItems: element.style.verticalAlign === 'top' ? 'flex-start' :
                       element.style.verticalAlign === 'bottom' ? 'flex-end' : 'center',
            justifyContent: element.style.textAlign === 'center' ? 'center' : 
                         element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            hyphens: 'auto',
            ...(element.transform3d ? {
              transform: `${
                `perspective(${element.transform3d.perspective ?? 0}px)`
              } rotateX(${element.transform3d.rotateX ?? 0}deg) rotateY(${element.transform3d.rotateY ?? 0}deg) rotateZ(${element.transform3d.rotateZ ?? 0}deg) translateZ(${element.transform3d.translateZ ?? 0}px)`
            } : {}),
          }}
        >
          <span style={{ 
            maxWidth: '100%', 
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: element.style.whiteSpace || 'normal'
          }}>
            {element.content.text || "Text element"}
          </span>
        </div>
      )

    case "image":
      return element.content.src ? (
        <img
          src={element.content.src || "/placeholder.svg"}
          alt={element.content.alt || ""}
          className="h-full w-full"
          style={{
            ...animationStyles,
            objectFit: element.style.objectFit || "contain",
          }}
        />
      ) : (
        <div
          className="bg-muted flex h-full w-full items-center justify-center"
          style={animationStyles}
        >
          <Image className={`text-muted-foreground ${isPreview ? 'h-full w-auto max-h-[50%]' : 'h-8 w-8'}`} />
        </div>
      )

    case "chart":
      return (
        <div className="h-full w-full" style={animationStyles}>
          <Chart type={element.content.chartType} isPreview={isPreview} />
        </div>
      )

    case "table":
      return (
        <div
          className="bg-muted flex h-full w-full items-center justify-center"
          style={animationStyles}
        >
          <Table className={`text-muted-foreground ${isPreview ? 'h-full w-auto max-h-[40%]' : 'h-8 w-8'}`} />
          {!isPreview && <span className="text-muted-foreground ml-2">Table</span>}
        </div>
      )
    case "rectangle":
    case "oval":
      return renderShape(element as ShapeElement, animationStyles)
    default:
      return (
        <div
          className="bg-muted flex h-full w-full items-center justify-center"
          style={animationStyles}
        >
          <span className="text-muted-foreground" style={{ fontSize: isPreview ? '0.5em' : 'inherit' }}>Unknown element</span>
        </div>
      )
  }
}

function renderShape(
  element: ShapeElement,
  animationStyles: React.CSSProperties
) {
  const shapeStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    ...animationStyles,
    ...(element.transform3d ? {
      transform: `${
        `perspective(${element.transform3d.perspective ?? 0}px)`
      } rotateX(${element.transform3d.rotateX ?? 0}deg) rotateY(${element.transform3d.rotateY ?? 0}deg) rotateZ(${element.transform3d.rotateZ ?? 0}deg) translateZ(${element.transform3d.translateZ ?? 0}px)`
    } : {}),
  }

  if (element.fill) {
    const anyFill: any = element.fill as any
    
    // Сбрасываем, чтобы не мешать шортхенд/нон-шортхенд
    ;(shapeStyles as any).background = undefined
    ;(shapeStyles as any).backgroundImage = undefined
    ;(shapeStyles as any).backgroundColor = undefined

    if (typeof anyFill === "string") {
      shapeStyles.backgroundColor = anyFill
    } else if (anyFill.type === 'image') {
      shapeStyles.backgroundImage = anyFill.src ? `url(${anyFill.src})` : 'none'
      shapeStyles.backgroundSize = anyFill.fit || 'cover'
      shapeStyles.backgroundPosition = 'center'
      shapeStyles.backgroundRepeat = 'no-repeat'
    } else {
      const gradientCSS = getGradientCSS(anyFill as GradientFill)
      shapeStyles.backgroundImage = gradientCSS
      shapeStyles.backgroundRepeat = 'no-repeat'
    }
  } else {
    // Если нет явной заливки, рисуем чёрным по умолчанию, чтобы фигуры были видимы
    shapeStyles.backgroundColor = "#000000"
  }

  if (element.type === "oval") {
    shapeStyles.borderRadius = "50%"
  }

  if ((element as any).stroke) {
    const s: any = (element as any).stroke
    shapeStyles.border = `${s.width ?? 0}px solid ${s.color ?? 'transparent'}`
  }

  return <div style={shapeStyles} />
}

function getGradientCSS(gradient: GradientFill): string {
  if (!gradient || !gradient.type) {
    return "none"
  }

  // Убеждаемся, что у нас есть цвета и stops
  if (!gradient.colors || !gradient.stops || gradient.colors.length === 0) {
    return "none"
  }

  if (gradient.type === "linear") {
    const angle = gradient.angle || 0
    return `linear-gradient(${angle}deg, ${gradient.colors
      .map((color, index) => {
        const stop = gradient.stops[index] || (index / (gradient.colors.length - 1))
        return `${color} ${Math.round(stop * 100)}%`
      })
      .join(", ")})`
  } else if (gradient.type === "radial") {
    return `radial-gradient(circle, ${gradient.colors
      .map((color, index) => {
        const stop = gradient.stops[index] || (index / (gradient.colors.length - 1))
        return `${color} ${Math.round(stop * 100)}%`
      })
      .join(", ")})`
  }

  return "none"
}
