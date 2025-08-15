"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Edit, Eye, Play, Trash2 } from 'lucide-react'
import { getUserStories } from '@/actions/slide'
import type { Story } from '@/lib/types'
import { toast } from 'sonner'

export default function MyStoriesPage() {
  const { data: session, status } = useSession()
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      setIsLoading(false)
      return
    }

    const loadStories = async () => {
      try {
        const userStories = await getUserStories()
        setStories(userStories)
      } catch (error) {
        console.error('Ошибка при загрузке историй:', error)
        toast.error('Не удалось загрузить ваши истории')
      } finally {
        setIsLoading(false)
      }
    }

    loadStories()
  }, [session, status])

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту историю?')) return
    
    try {
      const { deleteStory } = await import('@/actions/slide')
      const success = await deleteStory(id)
      
      if (success) {
        setStories(stories.filter(story => story.id !== id))
        toast.success('История удалена')
      } else {
        toast.error('Не удалось удалить историю')
      }
    } catch (error) {
      console.error('Ошибка при удалении истории:', error)
      toast.error('Произошла ошибка при удалении')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка ваших историй...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Мои истории</h1>
          <p className="text-muted-foreground mb-4">
            Войдите в систему, чтобы просмотреть ваши истории
          </p>
          <Button asChild>
            <Link href="/signin">Войти</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Мои истории</h1>
          <p className="text-muted-foreground mt-1">
            Управляйте своими презентациями и историями
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/editor/new">
            <Edit className="mr-2 h-4 w-4" />
            Создать историю
          </Link>
        </Button>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-xl font-semibold mb-2">Пока нет историй</h3>
            <p className="text-muted-foreground mb-6">
              Создайте свою первую презентацию, чтобы начать работу
            </p>
            <Button asChild>
              <Link href="/editor/new">
                <Edit className="mr-2 h-4 w-4" />
                Создать первую историю
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {story.title}
                    </CardTitle>
                    {story.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {story.description}
                      </p>
                    )}
                  </div>
                  {story.brandColor && (
                    <div
                      className="h-4 w-4 rounded-full ml-3 flex-shrink-0"
                      style={{ backgroundColor: story.brandColor }}
                    />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <CalendarDays className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(story.updatedAt).toLocaleDateString('ru-RU')}
                  </span>
                  {story.deckType && (
                    <Badge variant="secondary" className="text-xs">
                      {story.deckType}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {story.slides.length} слайд{story.slides.length === 1 ? '' : story.slides.length < 5 ? 'а' : 'ов'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link href={`/editor/${story.id}`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Редактировать
                    </Link>
                  </Button>
                  
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/stories/${story.id}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                  
                  <Button size="sm" asChild>
                    <Link href={`/presentation/${story.id}`} target="_blank">
                      <Play className="h-3 w-3" />
                    </Link>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(story.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
