"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"

import type { Slide } from "@/lib/types"
import { useTranslations } from "@/providers/translations-context"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface StoryTimelineProps {
  slides: Slide[]
  currentIndex: number
  onSelectSlide: (index: number) => void
  onAddSlide: () => void
  onReorderSlides?: (reorderedSlides: Slide[]) => void
}

interface SortableSlideProps {
  slide: Slide
  index: number
  isActive: boolean
  onSelect: () => void
}

function SortableSlide({ slide, index, isActive, onSelect }: SortableSlideProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: slide.id,
  })

  // Определяем стиль фона для миниатюры
  let backgroundStyle = {};
  if (slide.backgroundType === "gradient" && slide.gradientStart && slide.gradientEnd) {
    backgroundStyle = {
      background: `linear-gradient(${slide.gradientAngle || 45}deg, ${slide.gradientStart}, ${slide.gradientEnd})`,
    };
  } else if (slide.backgroundType === "color" || !slide.backgroundType) {
    backgroundStyle = { backgroundColor: slide.background || "#ffffff" };
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...backgroundStyle
  }

  return (
    <div className="h-16 flex flex-col gap-0.5">
      <button
        ref={setNodeRef as any}
        {...attributes}
        {...listeners}
        className={`aspect-video h-full w-auto cursor-pointer overflow-hidden rounded-md border bg-background transition-shadow hover:shadow-sm ${isActive ? "ring-primary ring-2" : ""} touch-manipulation`}
        onClick={onSelect}
        type="button"
        style={style}
      />
      <div className="flex items-center justify-center">
        <span className="text-muted-foreground text-[10px] leading-none">#{index + 1}</span>
      </div>
    </div>
  )
}

export function StoryTimeline({
  slides,
  currentIndex,
  onSelectSlide,
  onAddSlide,
  onReorderSlides,
}: StoryTimelineProps) {
  const { t } = useTranslations()
  const [isOpen, setIsOpen] = useState(true)
  const orderedSlides = useMemo(() => slides, [slides])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum distance for a drag to start
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleReorder = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (active && over && active.id !== over.id) {
      const activeIndex = orderedSlides.findIndex((slide) => slide.id === active.id)
      const overIndex = orderedSlides.findIndex((slide) => slide.id === over.id)
      
      // Create new array for the updated slide order
      const newSlidesOrder = [...orderedSlides]
      const [movedSlide] = newSlidesOrder.splice(activeIndex, 1)
      newSlidesOrder.splice(overIndex, 0, movedSlide)
      
      // Call parent handler to update state with reordered slides
      if (typeof onReorderSlides === 'function') {
        onReorderSlides(newSlidesOrder)
      }
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-muted/40 border-t min-h-[96px] flex flex-col"
    >
      <div className="flex w-full items-center justify-between border-b">
        <CollapsibleTrigger className="hover:bg-muted/60 p-2 flex items-center gap-2">
          <span className="i-lucide-film h-4 w-4" />
          <h2 className="text-xs font-semibold">{t('editor.panels.slides')}</h2>
          {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </CollapsibleTrigger>
        
        <div className="p-2">
          <Button size="sm" variant="ghost" onClick={(e) => {
            // Prevent the click from triggering the collapsible
            e.stopPropagation();
            onAddSlide();
          }} className="h-6 text-xs">
            <Plus className="mr-1 h-3 w-3" />
            {t('editor.panels.addSlide')}
          </Button>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="p-2">
          <ScrollArea className="h-16">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleReorder}
            >
              <SortableContext
                items={orderedSlides.map(slide => slide.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-1">
                  {orderedSlides.map((slide, index) => (
                    <SortableSlide 
                      key={slide.id}
                      slide={slide}
                      index={index}
                      isActive={index === currentIndex}
                      onSelect={() => onSelectSlide(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">{t('editor.panels.goTo')}</span>
              <Input
                className="h-7 w-16 text-xs"
                type="number"
                min={1}
                max={orderedSlides.length}
                value={currentIndex + 1}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (Number.isFinite(v)) {
                    const clamped = Math.min(Math.max(v, 1), orderedSlides.length)
                    onSelectSlide(clamped - 1)
                  }
                }}
              />
              <span className="text-xs">/ {orderedSlides.length}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs">{t('editor.panels.currentOrder')}</span>
              <Input
                className="h-7 w-16 text-xs"
                type="number"
                min={1}
                max={orderedSlides.length}
                value={currentIndex + 1}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (!Number.isFinite(v)) return
                  const nextPos = Math.min(Math.max(v, 1), orderedSlides.length) - 1
                  if (nextPos === currentIndex) return
                  const newSlidesOrder = [...orderedSlides]
                  const [moved] = newSlidesOrder.splice(currentIndex, 1)
                  newSlidesOrder.splice(nextPos, 0, moved)
                  onReorderSlides?.(newSlidesOrder)
                }}
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
