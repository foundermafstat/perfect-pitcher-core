"use client"
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import type { SlideElement } from "@/lib/types"
import { useTranslations } from "@/providers/translations-context"
// no collapsible here; the parent panel handles disclosure UI

interface LayersPanelProps {
  elements: SlideElement[]
  onReorder: (reorderedElements: SlideElement[]) => void
}

interface SortableItemProps {
  element: SlideElement
}

function SortableItem({ element }: SortableItemProps) {
  const { t } = useTranslations()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: element.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const getElementTypeLabel = (type: string): string => {
    return t(`editor.elementTypes.${type}` as any) || type
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-background mb-1.5 flex items-center rounded-md p-1.5 shadow-sm touch-manipulation border border-transparent hover:border-primary/20"
    >
      <span {...listeners} className="mr-2 cursor-move touch-manipulation">
        <GripVertical size={14} className="text-muted-foreground" />
      </span>
      <span className="truncate text-xs">
        {getElementTypeLabel(element.type)} 
        <span className="text-muted-foreground text-[10px] ml-1.5">{element.id.slice(-4)}</span>
      </span>
    </li>
  )
}

export function LayersPanel({ elements, onReorder }: LayersPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = elements.findIndex((element) => element.id === active.id)
      const newIndex = elements.findIndex((element) => element.id === over?.id)

      const newOrder = arrayMove(elements, oldIndex, newIndex)
      onReorder(newOrder)
    }
  }

  return (
    <div className="max-h-40 overflow-auto p-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={elements.map((el) => el.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {elements.map((element) => (
              <SortableItem key={element.id} element={element} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
