"use client"

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BookOpen, Loader2 } from "lucide-react"
import { useStories, type Story } from '@/hooks/use-stories'

interface StoryContextSelectorProps {
  onContextChange: (story: Story | null) => void
  selectedStoryId?: string
  disabled?: boolean
}

export function StoryContextSelector({ 
  onContextChange, 
  selectedStoryId,
  disabled = false 
}: StoryContextSelectorProps) {
  const { stories, isLoading, error } = useStories()
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)

  const handleStorySelect = (storyId: string) => {
    if (storyId === "none") {
      setSelectedStory(null)
      onContextChange(null)
      return
    }

    const story = stories.find(s => s.id === storyId)
    if (story) {
      setSelectedStory(story)
      onContextChange(story)
    }
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label htmlFor="story-context" className="text-sm font-medium">
          Контекст презентации
        </Label>
        <div className="text-sm text-muted-foreground">
          Ошибка загрузки историй
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="story-context" className="text-sm font-medium flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Контекст презентации
      </Label>
      <Select
        disabled={disabled || isLoading}
        value={selectedStoryId || selectedStory?.id || "none"}
        onValueChange={handleStorySelect}
      >
        <SelectTrigger id="story-context" className="w-full">
          <SelectValue placeholder={isLoading ? "Загрузка..." : "Выберите историю для контекста"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Загрузка историй...
              </div>
            </SelectItem>
          ) : (
            <>
              <SelectItem value="none">Без контекста</SelectItem>
              {stories.length > 0 ? (
                stories.map((story) => (
                  <SelectItem key={story.id} value={story.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{story.title}</span>
                      {story.description && (
                        <span className="text-xs text-muted-foreground">
                          {story.description.length > 50 
                            ? `${story.description.slice(0, 50)}...`
                            : story.description
                          }
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-stories" disabled>
                  Нет доступных историй
                </SelectItem>
              )}
            </>
          )}
        </SelectContent>
      </Select>
      {selectedStory && (
        <div className="text-xs text-muted-foreground">
          Выбрано: {selectedStory.title}
          {selectedStory.slides && ` (${selectedStory.slides.length} слайдов)`}
        </div>
      )}
    </div>
  )
}

