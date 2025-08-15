"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function NewProjectPage() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [loadingGen, setLoadingGen] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)

  const [problemStatement, setProblemStatement] = useState("")
  const [solutionApproach, setSolutionApproach] = useState<string>("")
  const [agentContext, setAgentContext] = useState("")
  const [technicalDesign, setTechnicalDesign] = useState("{\n  \"stack\": [],\n  \"modules\": [],\n  \"api\": []\n}")
  const [logoPrompt, setLogoPrompt] = useState("")
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [logoLoading, setLogoLoading] = useState(false)
  const [apiKeyTest, setApiKeyTest] = useState<string>("")

  async function handleGenerate() {
    try {
      setLoadingGen(true)
      const resp = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shortDescription }),
      })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      setProblemStatement(data.problemStatement || "")
      setSolutionApproach(typeof data.solutionApproach === 'string' ? data.solutionApproach : JSON.stringify(data.solutionApproach ?? {}, null, 2))
      setAgentContext(data.agentContext || "")
      setTechnicalDesign(JSON.stringify(data.technicalDesign ?? {}, null, 2))
    } catch (e: any) {
      toast({ title: "Ошибка генерации", description: e?.message || String(e), variant: "destructive" })
    } finally {
      setLoadingGen(false)
    }
  }

  async function handleSave() {
    try {
      setLoadingSave(true)
      // используем серверный экшен вместо прямого fetch к API для надёжной авторизации
      const saveProject = (await import("@/server-actions/projects")).saveProject
      // если поле похоже на JSON — отправляем объект, иначе строку
      let solutionApproachValue: any = solutionApproach
      try {
        const maybeJson = JSON.parse(solutionApproach)
        if (maybeJson && typeof maybeJson === 'object') solutionApproachValue = maybeJson
      } catch {}

      await saveProject({
        name,
        shortDescription,
        problemStatement,
        solutionApproach: solutionApproachValue,
        technicalDesign: JSON.parse(technicalDesign || "{}"),
        agentContext,
        logoBase64: logoPreview || undefined,
        logoMimeType: logoPreview ? "image/png" : undefined,
        logoPrompt: logoPrompt || undefined,
      })
      toast({ title: "Сохранено", description: "Проект создан" })
      window.location.href = "/projects"
    } catch (e: any) {
      toast({ title: "Ошибка сохранения", description: e?.message || String(e), variant: "destructive" })
    } finally {
      setLoadingSave(false)
    }
  }

  const canGenerate = name.trim().length >= 2 && shortDescription.trim().length >= 10
  const canSave = canGenerate && problemStatement && solutionApproach && agentContext

  async function handleGenerateLogo() {
    try {
      setLogoLoading(true)
      console.log('Начинаем генерацию логотипа...')
      
      const { generateLogoPreview } = await import("@/server-actions/projects")
      const res = await generateLogoPreview({ 
        prompt: logoPrompt || "современный минималистичный символ, технологический стиль", 
        name, 
        shortDescription, 
        size: "256x256" 
      })
      
      console.log('Получен ответ:', res)
      
      if (res?.base64) {
        setLogoPreview(res.base64)
        toast({ title: "Логотип сгенерирован" })
        console.log('Логотип успешно установлен')
      } else {
        throw new Error('Не получен base64 код изображения')
      }
    } catch (e: any) {
      console.error('Ошибка генерации логотипа:', e)
      toast({ 
        title: "Ошибка генерации логотипа", 
        description: e?.message || String(e), 
        variant: "destructive" 
      })
    } finally {
      setLogoLoading(false)
    }
  }

  async function testApiConnection() {
    try {
      setApiKeyTest("Тестирование...")
      const response = await fetch('/api/test-openai', { method: 'POST' })
      const result = await response.json()
      setApiKeyTest(result.success ? "✅ API работает" : `❌ ${result.error}`)
    } catch (e: any) {
      setApiKeyTest(`❌ Ошибка: ${e.message}`)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Новый проект</h1>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Название</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: PitchGen" />
        </div>

        <div className="grid gap-2">
          <Label>Короткое описание</Label>
          <Textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Коротко: какую проблему решаем и для кого"
            rows={4}
          />
        </div>

        <div>
          <Button disabled={!canGenerate || loadingGen} onClick={handleGenerate}>
            {loadingGen ? "Генерация..." : "Сгенерировать детали (OpenAI)"}
          </Button>
        </div>

        <div className="grid gap-2">
          <Label>Проблема</Label>
          <Textarea value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} rows={4} />
        </div>
        <div className="grid gap-2">
          <Label>Подход к решению</Label>
          <Textarea value={solutionApproach} onChange={(e) => setSolutionApproach(e.target.value)} rows={6} />
        </div>
        <div className="grid gap-2">
          <Label>Технический дизайн (JSON)</Label>
          <Textarea
            value={technicalDesign}
            onChange={(e) => setTechnicalDesign(e.target.value)}
            className={cn("font-mono", "min-h-40")}
          />
        </div>
        <div className="grid gap-2">
          <Label>Контекст ИИ-агента</Label>
          <Textarea value={agentContext} onChange={(e) => setAgentContext(e.target.value)} rows={4} />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Генерация логотипа (OpenAI)</Label>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                className="text-sm text-blue-500 hover:text-blue-700 underline"
                onClick={testApiConnection}
              >
                Тест API
              </button>
              {apiKeyTest && (
                <span className="text-sm">{apiKeyTest}</span>
              )}
            </div>
          </div>
          <Input value={logoPrompt} onChange={(e) => setLogoPrompt(e.target.value)} placeholder="Идея/стиль логотипа (будет белым с прозрачным фоном)" />
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleGenerateLogo} disabled={!canGenerate || logoLoading}>
                {logoLoading ? "Генерация..." : "Сгенерировать логотип"}
              </Button>
              {logoPreview && (
                <Button variant="ghost" onClick={() => setLogoPreview("")}>Очистить</Button>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-64 h-64 rounded border-2 border-dashed border-gray-300 bg-gray-800 flex items-center justify-center">
                {logoPreview ? (
                  <img
                    alt="logo preview"
                    className="max-w-full max-h-full object-contain"
                    src={`data:image/png;base64,${logoPreview}`}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">🎨</div>
                    <div className="text-sm">Логотип 256x256</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => (window.location.href = "/projects")}>Отмена</Button>
          <Button disabled={!canSave || loadingSave} onClick={handleSave}>
            {loadingSave ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  )
}


