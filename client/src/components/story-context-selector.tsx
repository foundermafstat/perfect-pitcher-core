"use client"

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useStories } from '@/hooks/use-stories'
import type { Story } from '@/lib/types'
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
  const [isFetchingStory, setIsFetchingStory] = useState(false)

  const handleStorySelect = async (storyId: string) => {
    if (storyId === "none") {
      setSelectedStory(null)
      onContextChange(null)
      return
    }

    const summary = stories.find(s => s.id === storyId) || null
    if (summary) setSelectedStory(summary)

    try {
      setIsFetchingStory(true)
      const res = await fetch(`/api/stories/${storyId}`, { method: 'GET' })
      if (res.ok) {
        const data = await res.json()
        const full = (data?.story || data) as Story | null
        if (full) {
          setSelectedStory(full)
          onContextChange(full)
          return
        }
      }
    } catch (e) {
      console.warn('Failed to fetch full story, falling back to summary', e)
    } finally {
      setIsFetchingStory(false)
    }

    // Fallback to summary
    if (summary) {
      onContextChange(summary)
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
          {isFetchingStory && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> {t('agent.loading')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

