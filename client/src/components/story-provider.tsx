"use client"
import { createContext, useContext, useState, type ReactNode } from 'react'

type StoryContextType = {
  currentStoryId: string | null
  setCurrentStoryId: (id: string | null) => void
}

const StoryContext = createContext<StoryContextType>({
  currentStoryId: null,
  setCurrentStoryId: () => {},
})

export function StoryProvider({ children }: { children: ReactNode }) {
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null)

  return (
    <StoryContext.Provider value={{ currentStoryId, setCurrentStoryId }}>
      {children}
    </StoryContext.Provider>
  )
}

export function useStory() {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider')
  }
  return context
}
