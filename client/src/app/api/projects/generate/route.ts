import { NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"

const bodySchema = z.object({
  name: z.string().min(2),
  shortDescription: z.string().min(10),
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

  const { name, shortDescription } = parsed.data

  if (!process.env.OPENAI_API_KEY) {
    // fallback mock for dev without key
    return NextResponse.json({
      problemStatement: `Проблема: ${shortDescription}`,
      solutionApproach: `Решение: MVP для ${name}`,
      technicalDesign: {
        stack: ["Next.js", "PostgreSQL", "Prisma"],
        modules: ["auth", "projects", "agent"],
        api: ["POST /api/projects", "GET /api/projects"],
      },
      agentContext: `Ты агент проекта ${name}. Короткое описание: ${shortDescription}. Отвечай кратко.`,
    })
  }

  const prompt = `Ты старший системный архитектор. На основе краткого описания проекта сгенерируй:
1) Краткое проблемное заявление
2) Подход к решению (архитектурно и продуктово)
3) Технический дизайн в JSON с ключами: stack (array), modules (array), api (array строк)
4) Краткий контекст для ИИ-агента при старте трансляции (agentContext)

ОПИСАНИЕ: «${shortDescription}». НАЗВАНИЕ: «${name}».
Ответ верни строго в формате JSON с ключами: problemStatement, solutionApproach, technicalDesign, agentContext.`

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Ты лаконичен и структурирован" },
        { role: "user", content: prompt },
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


