import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const story = await prisma.story.findUnique({
      where: { id },
      include: { slides: { include: { elements: true } } },
    })
    if (!story) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true, story })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    
    // Используем транзакцию для атомарного удаления
    await prisma.$transaction(async (tx) => {
      // Сначала удаляем все элементы всех слайдов
      await tx.element.deleteMany({
        where: {
          slide: {
            storyId: id
          }
        }
      })
      
      // Затем удаляем все слайды истории
      await tx.slide.deleteMany({
        where: { storyId: id }
      })
      
      // И наконец удаляем саму историю
      await tx.story.delete({ where: { id } })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting story:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}





