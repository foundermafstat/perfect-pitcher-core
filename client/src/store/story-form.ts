import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SectionKey =
  | 'name'
  | 'oneLiner'
  | 'stage'
  | 'problem'
  | 'audience'
  | 'urgency'
  | 'solution'
  | 'differentiation'
  | 'technologies'
  | 'productOverview'
  | 'demoAssets'
  | 'features'
  | 'marketCoverage'
  | 'marketSize'
  | 'competitors'
  | 'monetization'
  | 'traction'
  | 'goals'
  | 'team'
  | 'teamExperience'
  | 'funding'
  | 'visualAssets'
  | 'visualsNeed'

export type AnswersState = Record<SectionKey, any>

export type StoryFormState = {
  step: number
  deckType: 'startup' | 'sales' | 'launch' | 'strategy' | 'investor' | 'education' | 'keynote'
  brandColor: string
  logoPrompt: string
  logoPreview: string
  isGenerating: boolean
  isSubmitting: boolean
  logoLoading: boolean
  answers: AnswersState
  setStep: (step: number) => void
  setDeckType: (type: StoryFormState['deckType']) => void
  setBrandColor: (color: string) => void
  setLogoPrompt: (s: string) => void
  setLogoPreview: (b64: string) => void
  setGenerating: (v: boolean) => void
  setSubmitting: (v: boolean) => void
  setLogoLoading: (v: boolean) => void
  setAnswer: <K extends SectionKey>(key: K, value: any) => void
  addTag: (key: Extract<SectionKey, 'technologies' | 'features' | 'competitors' | 'marketCoverage'>, tag: string) => void
  removeTag: (key: Extract<SectionKey, 'technologies' | 'features' | 'competitors' | 'marketCoverage'>, tag: string) => void
  reset: () => void
}

const initialAnswers: AnswersState = {
  name: '',
  oneLiner: '',
  stage: 'idea',
  problem: '',
  audience: '',
  urgency: '',
  solution: '',
  differentiation: '',
  technologies: [],
  productOverview: '',
  demoAssets: '',
  features: [],
  marketCoverage: [],
  marketSize: '',
  competitors: [],
  monetization: '',
  traction: '',
  goals: '',
  team: '',
  teamExperience: '',
  funding: '',
  visualAssets: '',
  visualsNeed: '',
}

export const useStoryForm = create<StoryFormState>()(
  persist(
    (set, get) => ({
      step: 0,
      deckType: 'startup',
      brandColor: '#4f46e5',
      logoPrompt: '',
      logoPreview: '',
      isGenerating: false,
      isSubmitting: false,
      logoLoading: false,
      answers: initialAnswers,
      setStep: (step) => set({ step }),
      setDeckType: (deckType) => set({ deckType }),
      setBrandColor: (brandColor) => set({ brandColor }),
      setLogoPrompt: (logoPrompt) => set({ logoPrompt }),
      setLogoPreview: (logoPreview) => set({ logoPreview }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setLogoLoading: (logoLoading) => set({ logoLoading }),
      setAnswer: (key, value) => set({ answers: { ...get().answers, [key]: value } }),
      addTag: (key, tag) => {
        const arr = Array.isArray(get().answers[key]) ? (get().answers[key] as string[]) : []
        if (!tag.trim() || arr.includes(tag.trim())) return
        set({ answers: { ...get().answers, [key]: [...arr, tag.trim()] } })
      },
      removeTag: (key, tag) => {
        const arr = Array.isArray(get().answers[key]) ? (get().answers[key] as string[]) : []
        set({ answers: { ...get().answers, [key]: arr.filter((t) => t !== tag) } })
      },
      reset: () => set({
        step: 0,
        deckType: 'startup',
        brandColor: '#4f46e5',
        logoPrompt: '',
        logoPreview: '',
        isGenerating: false,
        isSubmitting: false,
        logoLoading: false,
        answers: initialAnswers,
      }),
    }),
    { name: 'newStoryForm' }
  )
)

export function isFormComplete(a: AnswersState, requiredKeys: SectionKey[]) {
  for (const k of requiredKeys) {
    const v = a[k]
    if (Array.isArray(v)) {
      if (v.length === 0) return false
    } else if (typeof v === 'string') {
      if (!v.trim()) return false
    } else if (v == null) {
      return false
    }
  }
  return true
}


