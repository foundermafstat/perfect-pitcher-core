"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Story, Slide } from "./types"
import { getStories } from "@/actions/slide"

type State = {
  stories: Story[]
  currentStory: Story | null
  currentSlideIndex: number
  isLoading: boolean
}

type Action =
  | { type: "SET_STORIES"; payload: Story[] }
  | { type: "SET_CURRENT_STORY"; payload: Story }
  | { type: "UPDATE_SLIDE"; payload: { storyId: string; slideIndex: number; updatedSlide: Slide } }
  | { type: "REORDER_SLIDES"; payload: { storyId: string; slides: Slide[] } }
  | { type: "SET_CURRENT_SLIDE_INDEX"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }

const initialState: State = {
  stories: [],
  currentStory: null,
  currentSlideIndex: 0,
  isLoading: true,
}

function storyReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STORIES":
      return { ...state, stories: action.payload, isLoading: false }
    case "SET_CURRENT_STORY":
      return { ...state, currentStory: action.payload, currentSlideIndex: 0 }
    case "UPDATE_SLIDE":
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.storyId
            ? {
                ...story,
                slides: story.slides.map((slide, index) =>
                  index === action.payload.slideIndex ? action.payload.updatedSlide : slide,
                ),
              }
            : story,
        ),
        currentStory:
          state.currentStory && state.currentStory.id === action.payload.storyId
            ? {
                ...state.currentStory,
                slides: state.currentStory.slides.map((slide, index) =>
                  index === action.payload.slideIndex ? action.payload.updatedSlide : slide,
                ),
              }
            : state.currentStory,
      }
    case "REORDER_SLIDES":
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.storyId ? { ...story, slides: action.payload.slides } : story,
        ),
        currentStory:
          state.currentStory && state.currentStory.id === action.payload.storyId
            ? { ...state.currentStory, slides: action.payload.slides }
            : state.currentStory,
      }
    case "SET_CURRENT_SLIDE_INDEX":
      return { ...state, currentSlideIndex: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

const StoryContext = createContext<
  | {
      state: State
      dispatch: React.Dispatch<Action>
    }
  | undefined
>(undefined)

export function StoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storyReducer, initialState)

  // Загружаем истории из базы данных при инициализации
  useEffect(() => {
    const loadStories = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const stories = await getStories()
        dispatch({ type: "SET_STORIES", payload: stories })
      } catch (error) {
        console.error("Ошибка при загрузке историй:", error)
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    loadStories()
  }, [])

  return <StoryContext.Provider value={{ state, dispatch }}>{children}</StoryContext.Provider>
}

export function useStory() {
  const context = useContext(StoryContext)
  if (context === undefined) {
    throw new Error("useStory must be used within a StoryProvider")
  }
  return context
}

