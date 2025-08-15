import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"

const baseSectionKeys = [
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

const bodySchema = z.object({
  // принимаем любой код локали, используем ru для русского, иначе английский
  locale: z.string().default("ru"),
  section: z.enum(baseSectionKeys as any).optional(),
  // Частичные ответы пользователя — используем по мере заполнения
  answers: z.record(z.any()).default({}),
  deckType: z.enum(["startup","sales","launch","strategy","investor","education","keynote"]).default("startup"),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { locale, section, answers, deckType } = parsed.data as { locale: string; section?: (typeof baseSectionKeys)[number]; answers: Record<string, unknown>, deckType: string }

  // Дев-фоллбек, если нет ключа
  if (!process.env.OPENAI_API_KEY) {
    const mock = {
      name: String(answers.name || "Новый проект"),
      oneLiner: `Проект: ${answers.name || "Без названия"}. ${answers.oneLiner || "Короткое описание."}`,
      stage: answers.stage || "idea",
      problem: answers.problem || "Опишите проблему",
      audience: answers.audience || "Целевая аудитория",
      urgency: answers.urgency || "Почему сейчас",
      solution: answers.solution || "Как решаем",
      differentiation: answers.differentiation || "Чем отличаемся",
      technologies: answers.technologies || ["Next.js", "PostgreSQL"],
      productOverview: answers.productOverview || "Как выглядит и работает продукт",
      demoAssets: answers.demoAssets || "Демо/прототип",
      features: answers.features || ["Фича 1", "Фича 2"],
      marketCoverage: answers.marketCoverage || "Рынки/сегменты",
      marketSize: answers.marketSize || "Размер рынка",
      competitors: answers.competitors || ["Конкурент А"],
      monetization: answers.monetization || "Как зарабатываем",
      traction: answers.traction || "Прогресс/метрики",
      goals: answers.goals || "Цели 6–12 мес",
      team: answers.team || "Команда",
      teamExperience: answers.teamExperience || "Экспертиза",
      funding: answers.funding || "Нужно ли финансирование",
      visualAssets: answers.visualAssets || "Есть ли стиль/логотип",
      visualsNeed: answers.visualsNeed || "Нужны ли иллюстрации",
    }
    if (section) return NextResponse.json({ [section]: (mock as any)[section] })
    return NextResponse.json(mock)
  }

  const sys = locale === "ru" ? "Ты лаконичен, говоришь по-русски, строго структурируешь ответы." : "You are concise, respond in English, and structure answers strictly."

  const deckPrompts: Record<string, string> = {
    ru: {
      startup: `Тип: Startup Pitch Deck. Верни только нужные ключи в JSON.`,
      sales: `Тип: Sales Deck. Верни только нужные ключи в JSON.`,
      launch: `Тип: Product Launch Deck. Верни только нужные ключи в JSON.`,
      strategy: `Тип: Internal Strategy Deck. Верни только нужные ключи в JSON.`,
      investor: `Тип: Investor Update Deck. Верни только нужные ключи в JSON.`,
      education: `Тип: Educational / Training Deck. Верни только нужные ключи в JSON.`,
      keynote: `Тип: Conference / Keynote Deck. Верни только нужные ключи в JSON.`,
    } as any,
    en: {
      startup: `Type: Startup Pitch Deck. Return only required keys as JSON.`,
      sales: `Type: Sales Deck. Return only required keys as JSON.`,
      launch: `Type: Product Launch Deck. Return only required keys as JSON.`,
      strategy: `Type: Internal Strategy Deck. Return only required keys as JSON.`,
      investor: `Type: Investor Update Deck. Return only required keys as JSON.`,
      education: `Type: Educational / Training Deck. Return only required keys as JSON.`,
      keynote: `Type: Conference / Keynote Deck. Return only required keys as JSON.`,
    } as any,
  } as any

  const langKey = locale === "ru" ? "ru" : "en"

  const fullPrompt = (
    locale === "ru"
      ? `Ты продакт-стратег. На основе частично заполненных ответов сгенерируй недостающие поля питча проекта.
Верни строго JSON. Ключи: ${section ? section : sectionKeys.join(", ")}.
Если ответы уже содержат информацию — улучши и переформулируй, но не противоречь.

Контекст: ${deckPrompts.ru[deckType]}

Текущие ответы: ${JSON.stringify(answers, null, 2)}
`
      : `You are a product strategist. Based on partially filled answers, generate the remaining fields for a project pitch.
Return strictly JSON. Keys: ${section ? section : sectionKeys.join(", ")}.
If answers already contain info, improve and rephrase without contradicting them.

Context: ${deckPrompts.en[deckType]}

Current answers: ${JSON.stringify(answers, null, 2)}
`
  )

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: fullPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    return NextResponse.json({ error: "OpenAI error", details: text }, { status: 500 })
  }

  const data = await resp.json()
  const content = data.choices?.[0]?.message?.content
  try {
    const parsedJson = JSON.parse(content)
    return NextResponse.json(parsedJson)
  } catch (e) {
    return NextResponse.json({ error: "Bad LLM JSON", raw: content }, { status: 502 })
  }
}


