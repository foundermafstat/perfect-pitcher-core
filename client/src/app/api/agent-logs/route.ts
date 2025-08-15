import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id as string | undefined
    const sessions = await prisma.agentSession.findMany({
      where: userId ? { userId } : undefined,
      include: {
        events: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    })
    
    return NextResponse.json({ success: true, sessions })
  } catch (error) {
    console.error('Error fetching agent logs:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
