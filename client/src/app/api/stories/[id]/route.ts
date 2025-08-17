import { NextRequest, NextResponse } from "next/server"
import { getStoryById, updateStory } from "@/actions/slide"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const story = await getStoryById(id)
    
    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, story })
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, deckType, locale, brandColor, thumbnail, finalDataEn, qaLocalized } = body

    const updatedStory = await updateStory(id, {
      title,
      description,
      deckType,
      locale,
      brandColor,
      thumbnail,
      finalDataEn,
      qaLocalized
    })

    if (!updatedStory) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, story: updatedStory })
  } catch (error) {
    console.error("Error updating story:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}





