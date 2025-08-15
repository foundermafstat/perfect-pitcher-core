import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sessionId, type, role, text, raw } = body || {}
    
    if (!sessionId || !type) {
      return NextResponse.json({ success: false, error: "sessionId and type are required" }, { status: 400 })
    }
    
    const event = await prisma.agentEvent.create({
      data: {
        sessionId,
        type,
        role: role ?? null,
        text: text ?? null,
        raw: raw ?? null,
      },
    })
    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Error creating agent event:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}


