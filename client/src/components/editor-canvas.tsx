"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { toJpeg, toPng } from "html-to-image"
import jsPDF from "jspdf"
import { createRoot } from "react-dom/client"

import { SlideViewer } from "./slide-viewer"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Download, FileText, Save, Settings, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useStory } from "@/lib/StoryContext"
import { useTranslations } from "@/providers/translations-context"

import { defaultBlueprints } from "@/lib/default-data"
import { renderElement } from "@/lib/element-renderer"
import type { Blueprint, Slide, SlideElement } from "@/lib/types"
import { Button } from "@/components/ui/button"

import { ElementSettingsPanel } from "./element-settings-panel"
import { SettingsSheet } from "./settings-sheet"
import { LayersPanel } from "./layers-panel"
import { SidePanel } from "./side-panel"
import { YoutubeBackground } from "./youtube-background"

interface EditorCanvasProps {
  slide: Slide
  onChange: (updatedSlide: Slide) => void
}

export function EditorCanvas({ slide, onChange }: EditorCanvasProps) {
  const { t } = useTranslations()
  const canvasRef = useRef<HTMLDivElement>(null)
  const { state } = useStory()
  const [selectedElements, setSelectedElements] = useState<SlideElement[]>([])
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false)
  const [settingsSheetElement, setSettingsSheetElement] = useState<SlideElement | null>(null)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true)
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true)
  const [draggedElement, setDraggedElement] = useState<{
    id: string;
    startX: number;
    startY: number;
    originalPositions: { id: string; x: number; y: number }[];
  } | null>(null)
  const [resizingElement, setResizingElement] = useState<{
    id: string
    startWidth: number
    startHeight: number
    startX: number
    startY: number
  } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [scale, setScale] = useState(1)
  const [selectionArea, setSelectionArea] = useState<{
    startX: number
    startY: number
    endX: number
    endY: number
  } | null>(null)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleElementClick = (element: SlideElement, e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.ctrlKey || e.metaKey) {
      setSelectedElements((prev) =>
        prev.some((el) => el.id === element.id)
          ? prev.filter((el) => el.id !== element.id)
          : [...prev, element]
      )
    } else {
      setSelectedElements([element])
    }
  }

  const handleCanvasClick = () => {
    setSelectedElements([])
    setIsSettingsPanelOpen(false)
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const startX = (e.clientX - rect.left)
        const startY = (e.clientY - rect.top)
        setSelectionArea({ startX, startY, endX: startX, endY: startY })
      }
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (selectionArea) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const endX = (e.clientX - rect.left)
        const endY = (e.clientY - rect.top)
        setSelectionArea({ ...selectionArea, endX, endY })
      }
    }
  }

  const handleCanvasMouseUp = () => {
    if (selectionArea) {
      if (scale > 0) {
        const scaledArea = {
          startX: selectionArea.startX / scale,
          startY: selectionArea.startY / scale,
          endX: selectionArea.endX / scale,
          endY: selectionArea.endY / scale,
        };
        const selected = slide.elements.filter((element) =>
          isElementInSelectionArea(element, scaledArea)
        )
        setSelectedElements(selected)
      }
      setSelectionArea(null)
    }
  }

  const isElementInSelectionArea = (
    element: SlideElement,
    area: typeof selectionArea
  ) => {
    if (!area) return false
    const { startX, startY, endX, endY } = area
    const left = Math.min(startX, endX)
    const right = Math.max(startX, endX)
    const top = Math.min(startY, endY)
    const bottom = Math.max(startY, endY)

    return (
      element.x < right &&
      element.x + element.width > left &&
      element.y < bottom &&
      element.y + element.height > top
    )
  }

  const handleElementMouseDown = (
    element: SlideElement,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    if (!selectedElements.some((el) => el.id === element.id)) {
      setSelectedElements([element])
    }

    if ((e.target as HTMLElement).classList.contains("resize-handle")) {
      setResizingElement({
        id: element.id,
        startWidth: element.width,
        startHeight: element.height,
        startX: e.clientX,
        startY: e.clientY,
      });
    } else {
      setDraggedElement({
        id: element.id,
        startX: e.clientX,
        startY: e.clientY,
        originalPositions: selectedElements.map(el => ({ id: el.id, x: el.x, y: el.y }))
      });
    }
  }

  const slideRef = useRef<HTMLDivElement>(null)
  const zoomContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculateScale = () => {
      // We use a timeout to ensure the DOM has updated after a panel is toggled
      setTimeout(() => {
        if (zoomContainerRef.current) {
          const newScale = zoomContainerRef.current.offsetWidth / 1920
          setScale(newScale)
        }
      }, 0)
    }

    calculateScale()

    const resizeObserver = new ResizeObserver(calculateScale)
    const currentZoomContainer = zoomContainerRef.current
    if (currentZoomContainer) {
      resizeObserver.observe(currentZoomContainer)
    }

    return () => {
      if (currentZoomContainer) {
        resizeObserver.unobserve(currentZoomContainer)
      }
    }
  }, [isSidePanelOpen, isLayersPanelOpen])

  const handleMouseMove = (e: MouseEvent) => {
    if (scale === 0) return // Avoid division by zero if canvas is not rendered

    if (draggedElement) {
      const element = slide.elements.find((el) => el.id === draggedElement.id)
      if (!element) return

      const dx = (e.clientX - draggedElement.startX) / scale
      const dy = (e.clientY - draggedElement.startY) / scale

      const updatedElements = slide.elements.map((el) => {
        const originalPos = draggedElement.originalPositions.find(p => p.id === el.id)
        if (selectedElements.some((selected) => selected.id === el.id) && originalPos) {
          return {
            ...el,
            x: originalPos.x + dx,
            y: originalPos.y + dy,
          }
        }
        return el
      })

      onChange({
        ...slide,
        elements: updatedElements,
      })
    } else if (resizingElement) {
      const element = slide.elements.find((el) => el.id === resizingElement.id)
      if (!element) return

      const deltaX = (e.clientX - resizingElement.startX) / scale
      const deltaY = (e.clientY - resizingElement.startY) / scale

      const newWidth = Math.max(resizingElement.startWidth + deltaX, 20)
      const newHeight = Math.max(resizingElement.startHeight + deltaY, 20)

      const updatedElements = slide.elements.map((el) =>
        el.id === element.id
          ? { ...el, width: newWidth, height: newHeight }
          : el
      )

      onChange({
        ...slide,
        elements: updatedElements,
      })
    }
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
    setResizingElement(null)
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggedElement, resizingElement])

  const handleElementUpdate = (updatedElements: SlideElement[]) => {
    const updatedSlideElements = slide.elements.map((el) => {
      const updatedElement = updatedElements.find(
        (updated) => updated.id === el.id
      )
      return updatedElement || el
    })
    onChange({
      ...slide,
      elements: updatedSlideElements,
    })
  }

  const handleSingleElementUpdate = (updatedElement: SlideElement) => {
    const updatedElements = slide.elements.map((el) => (el.id === updatedElement.id ? updatedElement : el))
    onChange({ ...slide, elements: updatedElements })
  }

  const handleDeleteElement = (elementId: string) => {
    const updatedElements = slide.elements.filter((el) => el.id !== elementId)
    onChange({
      ...slide,
      elements: updatedElements,
    })
    setSelectedElements((prev) => prev.filter((el) => el.id !== elementId))
  }

  const handleCopyElement = (element: SlideElement) => {
    const newElement: SlideElement = {
      ...element,
      id: `element-${Date.now()}`,
      x: element.x + 20, // Offset by 20px to the right
      y: element.y + 20, // Offset by 20px down
    }

    onChange({
      ...slide,
      elements: [...slide.elements, newElement],
    })

    // Select the new element
    setSelectedElements([newElement])
    toast.success(t('editor.canvas.elementCopied'))
  }

  const handleSaveAsPNG = () => {
    if (canvasRef.current) {
      const node = canvasRef.current;
      
      // Используем html-to-image вместо html2canvas
      toPng(node, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true, // Пропускаем шрифты для ускорения
        filter: (node) => {
          // Исключаем невидимые элементы
          return node.tagName !== 'BUTTON';
        },
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `slide-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          toast.success(t('editor.canvas.slideSavedPng'));
        })
        .catch((error) => {
          console.error('Ошибка при сохранении слайда:', error);
          toast.error(t('editor.canvas.slideSaveError'));
        });
    }
  }

  // Функция для экспорта всей презентации в PDF
  const handleSaveAsPDF = async () => {
    if (!slide) return;
    
    try {
      // Получаем все слайды из текущей истории
      const allSlides = state.currentStory?.slides || [];
      if (allSlides.length === 0) {
        toast.error(t('editor.canvas.noSlidesToExport'));
        return;
      }
      
      // Показываем уведомление о начале процесса
      toast.info(t('editor.canvas.preparingPdf').replace('{count}', allSlides.length.toString()));
      
      // Создаем PDF документ
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      // Размеры страницы PDF
      const imgWidth = 277; // A4 landscape width in mm (297 - margins)
      const imgHeight = 190; // A4 landscape height in mm (210 - margins)
      
      // Создаем временный контейнер для рендеринга SlideViewer
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1280px';
      tempContainer.style.height = '720px';
      tempContainer.style.overflow = 'hidden';
      document.body.appendChild(tempContainer);
      
      // Обрабатываем каждый слайд
      for (let i = 0; i < allSlides.length; i++) {
        const currentSlide = allSlides[i];
        
        // Очищаем контейнер
        tempContainer.innerHTML = '';
        
        // Создаем корень React для рендеринга SlideViewer
        const root = createRoot(tempContainer);
        
        // Рендерим SlideViewer с текущим слайдом
        root.render(<SlideViewer slide={currentSlide} useParallax={false} />);
        
        // Ждем, пока SlideViewer полностью отрендерится
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // Конвертируем слайд в изображение
          const slideImage = await toJpeg(tempContainer, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            skipFonts: true, // Пропускаем шрифты для ускорения
          });
          
          // Очищаем React корень
          root.unmount();
          
          // Добавляем новую страницу для всех слайдов кроме первого
          if (i > 0) {
            pdf.addPage();
          }
          
          // Добавляем изображение на страницу PDF
          pdf.addImage(slideImage, 'JPEG', 10, 10, imgWidth, imgHeight);
          
          // Обновляем прогресс
          toast.info(t('editor.canvas.processingSlide').replace('{current}', (i + 1).toString()).replace('{total}', allSlides.length.toString()), { id: 'pdf-progress' });
        } catch (slideError) {
          console.error(`Ошибка при обработке слайда ${i + 1}:`, slideError);
          toast.error(t('editor.canvas.slideProcessError').replace('{number}', (i + 1).toString()));
          // Продолжаем с следующим слайдом в случае ошибки
          continue;
        }
      }
      
      // Удаляем временный контейнер
      document.body.removeChild(tempContainer);
      
      // Сохраняем PDF
      const storyTitle = state.currentStory?.title || 'presentation';
      pdf.save(`${storyTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
      
      toast.success(t('editor.canvas.pdfExported'));
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      toast.error(t('editor.canvas.pdfExportError') + ': ' + (error instanceof Error ? error.message : t('editor.canvas.unknownError')));
    }
  }

  const handleAddElement = (blueprint: Blueprint) => {
    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type: blueprint.type,
      x: 100,
      y: 100,
      width: blueprint.defaultWidth || 200,
      height: blueprint.defaultHeight || 100,
      content: blueprint.defaultContent || {},
      style: blueprint.defaultStyle || {},
    }

    onChange({
      ...slide,
      elements: [...slide.elements, newElement],
    })
  }

  const handleReorderElements = (reorderedElements: SlideElement[]) => {
    onChange({
      ...slide,
      elements: reorderedElements,
    })
  }

  const handleBackgroundChange = (background: string) => {
    // При изменении цвета фона устанавливаем тип фона как 'color'
    onChange({
      ...slide,
      background,
      backgroundType: 'color'
    })
  }

  const handleBackgroundTypeChange = (type: string, value?: string) => {
    const updates: Partial<Slide> = {
      ...slide,
      backgroundType: type as "none" | "color" | "gradient" | "youtube",
    }

    if (type === "none") {
      updates.background = "transparent"
    } else if (type === "youtube" && value) {
      // Extract YouTube video ID from URL
      const videoId = extractYoutubeId(value)
      updates.youtubeBackground = value
    } else if (type === "gradient" && value) {
      try {
        const gradientData = JSON.parse(value)
        updates.gradientStart = gradientData.start
        updates.gradientEnd = gradientData.end
        updates.gradientAngle = gradientData.angle
        updates.background = `linear-gradient(${gradientData.angle}deg, ${gradientData.start}, ${gradientData.end})`
      } catch (e) {
        console.error("Invalid gradient data", e)
      }
    }
    
    // Обновляем слайд со всеми изменениями фона
    onChange(updates as Slide)
  }

  const handleSlideUpdate = (slideData: Partial<Slide>) => {
    onChange({
      ...slide,
      ...slideData,
    })
  }

  // Helper function to extract YouTube video ID from URL
  const extractYoutubeId = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : ""
  }

  // Determine background style based on backgroundType
  const getBackgroundStyle = (): React.CSSProperties => {
    if (slide.backgroundType === "gradient") {
      return {
        background: `linear-gradient(${slide.gradientAngle || 45}deg, ${slide.gradientStart || "#ffffff"}, ${slide.gradientEnd || "#000000"})`,
      }
    }

    if (slide.backgroundType === "youtube") {
      return {
        background: "black", // Fallback color for YouTube background
      }
    }

    return {
      backgroundColor:
        slide.backgroundType === "none" ? "transparent" : slide.background,
    }
  }

  const youtubeVideoId =
    slide.backgroundType === "youtube" && typeof slide.background === "string"
      ? extractYoutubeId(slide.background)
      : ""

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Header with section toggle buttons */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between border-b bg-background/90 px-4 py-1.5">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            title={t('editor.canvas.elementsPanel')}
          >
            <span className="mr-1">{t('editor.canvas.elementsTitle')}</span>
            {isSidePanelOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
            title={t('editor.canvas.layersTitle')}
          >
            <span className="mr-1">{t('editor.canvas.layersTitle')}</span>
            {isLayersPanelOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0"
            title={t('editor.canvas.zoomOut')}
          >
            <span className="text-sm font-medium">-</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0"
            title={t('editor.canvas.zoomIn')}
          >
            <span className="text-sm font-medium">+</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAsPNG}
            className="h-7 w-7 p-0"
            title={t('editor.canvas.saveAsPng')}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAsPDF}
            className="h-7 w-7 p-0"
            title={t('editor.canvas.exportToPdf')}
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main content layout */}
      <div className="flex h-full w-full pt-10">
        {/* Side panel with conditional rendering */}
        {isSidePanelOpen && (
          <SidePanel
            slide={slide}
            blueprints={defaultBlueprints}
            onAddElement={handleAddElement}
            onReorderElements={handleReorderElements}
            onBackgroundChange={handleBackgroundChange}
            onBackgroundTypeChange={handleBackgroundTypeChange}
            onSlideUpdate={handleSlideUpdate}
          />
        )}

        {/* Canvas area */}
        <div className="relative flex-1 overflow-hidden bg-gray-100">
          <div
            ref={canvasRef}
            className="flex h-full w-full items-center justify-center"
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            <div
              ref={zoomContainerRef}
              className="aspect-video w-full max-w-full max-h-full origin-center flex items-center justify-center"
              style={{ transform: `scale(${zoom})` }}
            >
              <div
                ref={slideRef}
                className="origin-top-left overflow-hidden rounded-lg bg-white shadow-lg relative"
                style={{
                  ...getBackgroundStyle(),
                  width: '1920px',
                  height: '1080px',
                  transform: `scale(${scale})`,
                }}
              >
                {slide.backgroundType === 'youtube' && youtubeVideoId && (
                  <YoutubeBackground videoId={youtubeVideoId} isActive={true} />
                )}

                {slide.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move ${
                      selectedElements.some((el) => el.id === element.id)
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    style={{
                      transform: `translate(${element.x}px, ${element.y}px)`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      zIndex: 10,
                    }}
                    onClick={(e) => handleElementClick(element, e)}
                    onMouseDown={(e) => handleElementMouseDown(element, e)}
                  >
                    {renderElement(element)}

                    {selectedElements.some((el) => el.id === element.id) && (
                      <>
                        <div className="resize-handle absolute -right-2 -bottom-2 h-4 w-4 cursor-se-resize rounded-full bg-blue-500" />
                        
                        {/* Element controls positioned in top-right corner */}
                        <div className="absolute -top-2 -right-2 flex gap-1">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-md shadow-sm bg-white border"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyElement(element)
                            }}
                            title={t('editor.canvas.copyElement')}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-md shadow-sm bg-white border"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSettingsSheetElement(element)
                              setIsSettingsPanelOpen(true)
                            }}
                            title={t('editor.canvas.elementSettings')}
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-md shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteElement(element.id)
                            }}
                            title={t('editor.canvas.deleteElement')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {selectionArea && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-200 opacity-30"
                    style={{
                      left: `${Math.min(
                        selectionArea.startX,
                        selectionArea.endX
                      )}px`,
                      top: `${Math.min(
                        selectionArea.startY,
                        selectionArea.endY
                      )}px`,
                      width: `${Math.abs(
                        selectionArea.endX - selectionArea.startX
                      )}px`,
                      height: `${Math.abs(
                        selectionArea.endY - selectionArea.startY
                      )}px`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SettingsSheet
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        element={settingsSheetElement}
        onUpdate={handleSingleElementUpdate}
      />
    </div>
  )
}
