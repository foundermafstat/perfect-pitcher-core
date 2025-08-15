import Link from "next/link"
import { BookOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StoryCard } from "@/components/story-card"
import { getStories } from "@/actions/slide"

export default async function Home() {
  // Получаем истории из базы данных с помощью серверного экшена
  const stories = await getStories()

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Perfect Pitcher</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Create compelling presentations through a story-driven approach. Drag
          and drop elements to build your narrative.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/editor/new">
              <Plus className="mr-2 h-4 w-4" />
              New Story
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/templates">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Templates
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Your Stories</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </main>
  )
}
