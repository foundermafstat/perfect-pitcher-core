"use client"

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BookOpen, Loader2 } from "lucide-react"
import { useStories, type Story } from '@/hooks/use-stories'
import { useTranslations } from "@/providers/translations-context"

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
  const { t } = useTranslations()
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
          {t('agent.storyContext')}
        </Label>
        <div className="text-sm text-muted-foreground">
          {t('agent.storyContextError')}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="story-context" className="text-sm font-medium flex items-center gap-2">
        
        {t('agent.storyContext')}
      </Label>
      <Select
        disabled={disabled || isLoading}
        value={selectedStoryId || selectedStory?.id || "none"}
        onValueChange={handleStorySelect}
      >
        <SelectTrigger id="story-context" className="w-full">
          <SelectValue placeholder={isLoading ? t('agent.loading') : t('agent.selectStory')} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('agent.loadingStories')}
              </div>
            </SelectItem>
          ) : (
            <>
              <SelectItem value="none">{t('agent.noContext')}</SelectItem>
              {stories.length > 0 ? (
                stories.map((story) => (
                  <SelectItem key={story.id} value={story.id}>
                    <span className="font-medium">{story.title}</span>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-stories" disabled>
                  {t('agent.noStoriesAvailable')}
                </SelectItem>
              )}
            </>
          )}
        </SelectContent>
      </Select>
      {selectedStory && (
        <div className="text-xs text-muted-foreground">
          {t('agent.selected')}: {selectedStory.title}
          {selectedStory.slides && ` (${selectedStory.slides.length} ${t('agent.slides')})`}
        </div>
      )}
    </div>
  )
}

