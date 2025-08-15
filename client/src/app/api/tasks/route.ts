import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, status, priority, dueDate, userId } = body || {}
    if (!title || typeof title !== "string") {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }
    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        status: status ?? undefined,
        priority: typeof priority === "number" ? priority : 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: userId ?? null,
      },
    })
    return NextResponse.json({ success: true, task })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}


