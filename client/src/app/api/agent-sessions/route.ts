import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { voice, locale, meta } = body || {}
    const userSession = await auth()
    if (!userSession?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: userSession.user.email } })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    // Стоимость запуска трансляции (в токенах). Можно вынести в конфиг/БД.
    const sessionStartCost = 10
    if (user.tokenBalance < sessionStartCost) {
      return NextResponse.json({ success: false, error: "Недостаточно токенов" }, { status: 402 })
    }

    // Атомарно: создаем сессию и списываем токены с записью транзакции
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.agentSession.create({
        data: {
          userId: user.id,
          voice: voice ?? null,
          locale: locale ?? null,
          meta: meta ?? null,
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: { tokenBalance: { decrement: sessionStartCost } },
      })

      await tx.tokenTransaction.create({
        data: {
          userId: user.id,
          amount: -sessionStartCost,
          type: "DEBIT",
          reason: "agent_session_start",
          sessionId: created.id,
          meta: meta ?? undefined,
        },
      })

      return created
    })

    return NextResponse.json({ success: true, session: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status, end } = body || {}
    const session = await prisma.agentSession.update({
      where: { id },
      data: { status: status ?? undefined, endedAt: end ? new Date() : undefined },
    })
    return NextResponse.json({ success: true, session })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}


