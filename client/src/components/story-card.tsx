import Link from "next/link"
import { Edit, Play } from "lucide-react"

import { renderElement } from "@/lib/element-renderer"
import type { Story } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  const firstSlide = story.slides[0]

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted relative aspect-video">
        {firstSlide ? (
          <div
            className="h-full w-full relative"
            style={{
              backgroundColor: firstSlide.background,
            }}
          >
            {firstSlide.elements.map((element) => (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: `${(element.x / 1280) * 100}%`,
                  top: `${(element.y / 720) * 100}%`,
                  width: `${(element.width / 1280) * 100}%`,
                  height: `${(element.height / 720) * 100}%`,
                  fontSize: `calc(${(element.width / 1280) * 100}% * 0.12)`,
                  transform: 'scale(1)', // Возвращаю нормальный масштаб
                  transformOrigin: 'center' // Возвращаю стандартное позиционирование
                }}
              >
                {renderElement(element, true)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-muted-foreground">No slides</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 text-lg font-semibold">{story.title}</h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {story.description}
        </p>
        <div className="text-muted-foreground mt-2 flex items-center text-xs">
          <span>{story.slides.length} slides</span>
          <span className="mx-2">•</span>
          <span>
            Last edited {new Date(story.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="gap-2 p-4 pt-0">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/editor/${story.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link href={`/presentation/${story.id}`}>
            <Play className="mr-2 h-4 w-4" />
            Present
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
