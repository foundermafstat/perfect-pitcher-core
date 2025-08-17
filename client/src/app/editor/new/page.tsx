"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

import { createStory, type CreateStoryInput } from "@/actions/slide"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "@/providers/translations-context"
import { useStoryForm, isFormComplete } from "@/store/story-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type Locale = "ru" | "en"

const sectionOrder = [
  "name",
  "oneLiner",
  "stage",
  "problem",
  "audience",
  "urgency",
  "solution",
  "differentiation",
  "technologies",
  "productOverview",
  "demoAssets",
  "features",
  "marketCoverage",
  "marketSize",
  "competitors",
  "monetization",
  "traction",
  "goals",
  "team",
  "teamExperience",
  "funding",
  "visualAssets",
  "visualsNeed",
] as const

type Answers = Record<(typeof sectionOrder)[number], any>

export default function NewStoryPage() {
  const router = useRouter()
  const { t, locale } = useTranslations()
  const store = useStoryForm()

  const isSubmitting = store.isSubmitting
  const isGenerating = store.isGenerating
  const logoLoading = store.logoLoading
  const logoPreview = store.logoPreview
  const logoPrompt = store.logoPrompt
  const step = store.step
  const answers = store.answers as Answers

  const label = (key: keyof Answers) => t(`newStory.fields.${String(key)}`)

  const steps: { title: string; fields: { key: keyof Answers; label: string; type?: "textarea" | "input" }[] }[] = useMemo(() => {
    const type = store.deckType
    if (type === 'startup') {
      return [
        { title: t("newStory.sections.basics.title"), fields: [
          { key: "name", label: label("name") },
          { key: "oneLiner", label: label("oneLiner"), type: "textarea" },
          { key: "stage", label: label("stage") },
        ] },
        { title: t("newStory.sections.problem.title"), fields: [
          { key: "problem", label: label("problem"), type: "textarea" },
          { key: "audience", label: label("audience") },
        ] },
        { title: t("newStory.sections.solution.title"), fields: [
          { key: "solution", label: label("solution"), type: "textarea" },
          { key: "differentiation", label: label("differentiation"), type: "textarea" },
          { key: "technologies", label: label("technologies") },
        ] },
        { title: t("newStory.sections.product.title"), fields: [
          { key: "productOverview", label: label("productOverview"), type: "textarea" },
          { key: "features", label: label("features") },
        ] },
        { title: t("newStory.sections.more.title"), fields: [
          { key: "marketCoverage", label: label("marketCoverage") },
          { key: "marketSize", label: label("marketSize") },
          { key: "competitors", label: label("competitors") },
          { key: "monetization", label: label("monetization") },
          { key: "traction", label: label("traction") },
          { key: "team", label: label("team") },
          { key: "funding", label: label("funding") },
        ] },
        { title: t("newStory.sections.visuals.title"), fields: [
          { key: "visualAssets", label: label("visualAssets") },
          { key: "visualsNeed", label: label("visualsNeed") },
        ] },
      ]
    }
    if (type === 'sales') {
      return [
        { title: t("newStory.sections.basics.title"), fields: [
          { key: "productName" as any, label: t('newStory.fields.productName') },
          { key: "audience", label: label("audience") },
          { key: "pains" as any, label: t('newStory.fields.pains'), type: 'textarea' },
        ] },
        { title: t("newStory.sections.solution.title"), fields: [
          { key: "solvePains" as any, label: t('newStory.fields.solvePains'), type: 'textarea' },
          { key: "features", label: label("features") },
        ] },
        { title: t("newStory.sections.product.title"), fields: [
          { key: "caseStudies" as any, label: t('newStory.fields.caseStudies') },
          { key: "roi" as any, label: t('newStory.fields.roi') },
          { key: "pricing" as any, label: t('newStory.fields.pricing') },
          { key: "nextSteps" as any, label: t('newStory.fields.nextSteps') },
        ] },
      ]
    }
    if (type === 'launch') {
      return [
        { title: t("newStory.sections.basics.title"), fields: [
          { key: "productName" as any, label: t('newStory.fields.productName') },
          { key: "productVersion" as any, label: t('newStory.fields.productVersion') },
        ] },
        { title: t("newStory.sections.solution.title"), fields: [
          { key: "problem", label: label("problem"), type: 'textarea' },
          { key: "usp" as any, label: t('newStory.fields.usp') },
          { key: "innovations" as any, label: t('newStory.fields.innovations') },
          { key: "differencePrev" as any, label: t('newStory.fields.differencePrev') },
        ] },
        { title: t("newStory.sections.more.title"), fields: [
          { key: "audience", label: label("audience") },
          { key: "releaseTimeline" as any, label: t('newStory.fields.releaseTimeline') },
          { key: "pricing" as any, label: t('newStory.fields.pricing') },
          { key: "nextSteps" as any, label: t('newStory.fields.nextSteps') },
        ] },
      ]
    }
    if (type === 'strategy') {
      return [
        { title: t("newStory.sections.basics.title"), fields: [
          { key: "companyStatus" as any, label: t('newStory.fields.companyStatus') },
          { key: "periodGoals" as any, label: t('newStory.fields.periodGoals') },
          { key: "challenges" as any, label: t('newStory.fields.challenges') },
        ] },
        { title: t("newStory.sections.solution.title"), fields: [
          { key: "strategy" as any, label: t('newStory.fields.strategy') },
          { key: "roadmap" as any, label: t('newStory.fields.roadmap') },
          { key: "kpis" as any, label: t('newStory.fields.kpis') },
        ] },
        { title: t("newStory.sections.more.title"), fields: [
          { key: "responsibilities" as any, label: t('newStory.fields.responsibilities') },
          { key: "resources" as any, label: t('newStory.fields.resources') },
        ] },
      ]
    }
    if (type === 'investor') {
      return [
        { title: t("newStory.sections.basics.title"), fields: [
          { key: "companyStage" as any, label: t('newStory.fields.companyStage') },
          { key: "achievements" as any, label: t('newStory.fields.achievements') },
          { key: "keyMetrics" as any, label: t('newStory.fields.keyMetrics') },
        ] },
        { title: t("newStory.sections.product.title"), fields: [
          { key: "productUpdates" as any, label: t('newStory.fields.productUpdates') },
          { key: "marketChanges" as any, label: t('newStory.fields.marketChanges') },
          { key: "teamUpdates" as any, label: t('newStory.fields.teamUpdates') },
        ] },
        { title: t("newStory.sections.more.title"), fields: [
          { key: "goals", label: label('goals') },
          { key: "fundingStatus" as any, label: t('newStory.fields.fundingStatus') },
        ] },
      ]
    }
    if (type === 'education') {
      return [
        { title: t("newStory.sections.basics.title"), fields: [
          { key: "topic" as any, label: t('newStory.fields.topic') },
          { key: "knowledgeLevel" as any, label: t('newStory.fields.knowledgeLevel') },
          { key: "learningObjectives" as any, label: t('newStory.fields.learningObjectives') },
        ] },
        { title: t("newStory.sections.solution.title"), fields: [
          { key: "keyConcepts" as any, label: t('newStory.fields.keyConcepts') },
          { key: "contentStructure" as any, label: t('newStory.fields.contentStructure') },
          { key: "examples" as any, label: t('newStory.fields.examples') },
        ] },
        { title: t("newStory.sections.more.title"), fields: [
          { key: "takeaways" as any, label: t('newStory.fields.takeaways') },
          { key: "exercises" as any, label: t('newStory.fields.exercises') },
        ] },
      ]
    }
    // keynote
    return [
      { title: t("newStory.sections.basics.title"), fields: [
        { key: "talkTitle" as any, label: t('newStory.fields.talkTitle') },
        { key: "speaker" as any, label: t('newStory.fields.speaker') },
      ] },
      { title: t("newStory.sections.solution.title"), fields: [
        { key: "bigIdea" as any, label: t('newStory.fields.bigIdea') },
        { key: "audienceExpectations" as any, label: t('newStory.fields.audienceExpectations') },
        { key: "keyPoints" as any, label: t('newStory.fields.keyPoints') },
      ] },
      { title: t("newStory.sections.more.title"), fields: [
        { key: "supportingData" as any, label: t('newStory.fields.supportingData') },
        { key: "conclusionCta" as any, label: t('newStory.fields.conclusionCta') },
      ] },
    ]
  }, [locale, t, store.deckType])

  async function generateAll() {
    try {
      store.setGenerating(true)
      const resp = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, answers }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      Object.entries(data).forEach(([k, v]) => store.setAnswer(k as any, v))
      toast.success(locale === "ru" ? "Сгенерировано" : "Generated")
    } catch (e: any) {
      toast.error(e?.message || String(e))
    } finally {
      store.setGenerating(false)
    }
  }

  async function regenerateSection(key: (typeof sectionOrder)[number]) {
    try {
      const resp = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, section: key, answers }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      Object.entries(data).forEach(([k, v]) => store.setAnswer(k as any, v))
      toast.success(locale === "ru" ? "Готово" : "Done")
    } catch (e: any) {
      toast.error(e?.message || String(e))
    }
  }

  async function handleGenerateLogo() {
    try {
      store.setLogoLoading(true)
      const { generateLogoPreview } = await import("@/server-actions/projects")
      const prompt = logoPrompt || `${answers.name} — ${answers.oneLiner || "минималистичный символ"}`
      const res = await generateLogoPreview({ prompt, name: answers.name, shortDescription: answers.oneLiner, size: "512x512" })
      store.setLogoPreview(res.base64)
      toast.success(locale === "ru" ? "Логотип сгенерирован" : "Logo generated")
    } catch (e: any) {
      toast.error(e?.message || String(e))
    } finally {
      store.setLogoLoading(false)
    }
  }

  // Required keys динамически по типу
  const requiredByType: Record<string, (keyof Answers)[]> = {
    startup: ["name","oneLiner","problem","audience","solution","productOverview","features","marketSize","competitors","monetization","traction","team","funding"],
    sales: ["audience","features"],
    launch: ["productOverview","audience"],
    strategy: ["goals"],
    investor: ["goals"],
    education: ["productOverview"],
    keynote: ["oneLiner"],
  }
  const requiredKeys = requiredByType[store.deckType] ?? []
  const canCreate = isFormComplete(store.answers as any, requiredKeys as any)

  const submittedRef = useRef(false)
  // Автосоздание истории, когда форма полностью заполнена
  if (typeof window !== 'undefined') {
    // small guard to keep ref in sync after hydration
    // no-op
  }
  
  // Автоматическое создание отключено - пользователь должен нажать кнопку
  // useEffect(() => {
  //   if (canCreate && !isSubmitting && !submittedRef.current) {
  //     submittedRef.current = true
  //     // запускаем сохранение без кнопки
  //     void (async () => {
  //       try {
  //         const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent
  //         await handleSubmit(fakeEvent)
  //       } catch (e) {
  //         submittedRef.current = false
  //       }
  //     })()
  //   }
  // }, [canCreate, isSubmitting])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canCreate) {
      toast.error(locale === "ru" ? "Введите название" : "Enter a name")
      return
    }
    store.setSubmitting(true)
    try {
      const finalDataEn = {
        type: store.deckType,
        data: answers, // упрощенно: можно трансформировать в финальный шаблон конкретного типа
      }
      const qaLocalized = { locale, answers }
      const newStory: any = {
        title: answers.name,
        description: String(answers.oneLiner || ""),
        thumbnail: logoPreview ? `data:image/png;base64,${logoPreview}` : "/placeholder.svg?height=200&width=300",
        deckType: store.deckType,
        locale,
        brandColor: store.brandColor,
        finalDataEn: locale === 'en' ? finalDataEn : finalDataEn,
        qaLocalized: locale === 'en' ? undefined : qaLocalized,
        slides: [
          { title: locale === "ru" ? "Слайд 1" : "Slide 1", background: "#ffffff", elements: [] },
        ],
      }
      const createdStory = await createStory(newStory)
      if (createdStory) {
        toast.success(locale === "ru" ? "История создана!" : "Story created!", {
          description: locale === "ru" ? "Нажмите здесь чтобы перейти к редактированию" : "Click here to go to editor",
          action: {
            label: locale === "ru" ? "Редактировать" : "Edit",
            onClick: () => router.push(`/editor/${createdStory.id}`)
          }
        })
        // Убран автоматический редирект - пользователь остается на странице
        // Сбрасываем флаг чтобы можно было создать ещё одну историю
        submittedRef.current = false
      } else {
        throw new Error("Failed to create story")
      }
    } catch (error) {
      console.error("Ошибка при создании истории:", error)
      toast.error(locale === "ru" ? "Ошибка при создании" : "Create error")
    } finally {
      store.setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("newStory.title")}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Превью */}
        <motion.div layout className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{t("newStory.preview")}</div>
            <div className="flex items-center gap-2">
          <Input
                value={logoPrompt}
                onChange={(e) => store.setLogoPrompt(e.target.value)}
                placeholder={t("newStory.logoPromptPlaceholder")}
              />
              <Button onClick={handleGenerateLogo} disabled={logoLoading} variant="secondary">
                {logoLoading ? t("newStory.loading") : t("newStory.generateLogo")}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded border bg-white">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="logo" className="h-full w-full object-contain" src={`data:image/png;base64,${logoPreview}`} />
              ) : (
                <div className="text-xs opacity-50">logo</div>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xl font-semibold" style={{ color: store.brandColor }}>{answers.name || t("newStory.placeholders.projectName")}</div>
              <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{answers.oneLiner || t("newStory.placeholders.oneLiner")}</div>
            </div>
          </div>

          {/* Бренд-стиль */}
          <div className="mt-4 flex items-center gap-3">
            <Label className="text-sm">Brand</Label>
            <input type="color" value={store.brandColor} onChange={(e) => store.setBrandColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded border p-0" />
            <div className="rounded px-2 py-1 text-xs" style={{ background: store.brandColor, color: '#fff' }}>
              {store.brandColor}
            </div>
            <Button variant="ghost" size="sm" onClick={() => store.setBrandColor('#4f46e5')}>Reset</Button>
          </div>

          <div className="mt-4 grid gap-3">
            {sectionOrder.map((key) => (
              <div key={key} className="rounded border p-3" style={{ borderColor: store.brandColor }}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">{label(key)}</div>
                  <Button size="sm" variant="ghost" onClick={() => regenerateSection(key)}>
                    {t("newStory.regenerate")}
                  </Button>
                </div>
                <div className="text-sm whitespace-pre-line break-words opacity-90">
                  {String(answers[key] ?? "") || t("newStory.placeholders.empty")}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Форма */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm opacity-70">
              {t("newStory.stepLabel", { current: step + 1, total: steps.length })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => store.setStep(Math.max(0, step - 1))} disabled={step === 0}>
                ←
              </Button>
              <Button variant="outline" onClick={() => store.setStep(Math.min(steps.length - 1, step + 1))} disabled={step === steps.length - 1}>
                →
              </Button>
              <Button onClick={generateAll} disabled={isGenerating}>
                {isGenerating ? t("newStory.loading") : t("newStory.generateAll")}
              </Button>
              <Button variant="ghost" onClick={() => store.reset()}>Reset</Button>
            </div>
        </div>
        
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 text-lg font-semibold">{steps[step].title}</div>
              <div className="grid gap-3">
                {/* Переключатель типа презентации */}
                <div className="grid gap-2">
                  <Label>{t('newStory.deckType.label')}</Label>
                  <Select value={store.deckType} onValueChange={(v) => store.setDeckType(v as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">{t('newStory.deckType.startup')}</SelectItem>
                      <SelectItem value="sales">{t('newStory.deckType.sales')}</SelectItem>
                      <SelectItem value="launch">{t('newStory.deckType.launch')}</SelectItem>
                      <SelectItem value="strategy">{t('newStory.deckType.strategy')}</SelectItem>
                      <SelectItem value="investor">{t('newStory.deckType.investor')}</SelectItem>
                      <SelectItem value="education">{t('newStory.deckType.education')}</SelectItem>
                      <SelectItem value="keynote">{t('newStory.deckType.keynote')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {steps[step].fields.map((f) => (
                  <div key={String(f.key)} className="grid gap-2">
                    <Label>{f.label}</Label>
                    {f.key === 'stage' ? (
                      <Select value={String(answers[f.key] ?? 'idea')} onValueChange={(v) => store.setAnswer('stage' as any, v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="mvp">MVP</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="scale">Scale</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : ['technologies','features','competitors','marketCoverage'].includes(f.key as any) ? (
                      <TagInput
                        value={Array.isArray(answers[f.key]) ? (answers[f.key] as any) : []}
                        onAdd={(tag) => store.addTag(f.key as any, tag)}
                        onRemove={(tag) => store.removeTag(f.key as any, tag)}
                        placeholder={t("newStory.placeholders.empty")}
                      />
                    ) : f.type === "textarea" ? (
          <Textarea
                        value={String(answers[f.key] ?? "")}
                        onChange={(e) => store.setAnswer(f.key as any, e.target.value)}
            rows={4}
          />
                    ) : (
                      <Input
                        value={String(answers[f.key] ?? "")}
                        onChange={(e) => store.setAnswer(f.key as any, e.target.value)}
                      />
                    )}
                    <div>
                      <Button size="sm" variant="secondary" onClick={() => regenerateSection(f.key)}>
                        {t("newStory.regenerate")}
                      </Button>
                    </div>
                  </div>
                ))}
        </div>
            </motion.div>
          </AnimatePresence>
        
          <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            disabled={isSubmitting}
          >
              {t("newStory.cancel")}
          </Button>
            {/* Кнопка создания истории */}
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!canCreate || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? t("newStory.loading") : t("newStory.create") || "Создать историю"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TagInput({ value, onAdd, onRemove, placeholder }: { value: string[]; onAdd: (tag: string) => void; onRemove: (tag: string) => void; placeholder?: string }) {
  const [input, setInput] = useState("")
  return (
    <div className="rounded border p-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="ml-1 opacity-70 hover:opacity-100">×</button>
          </Badge>
        ))}
      </div>
      <Input
        className="mt-2"
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onAdd(input)
            setInput('')
          }
        }}
      />
    </div>
  )
}
