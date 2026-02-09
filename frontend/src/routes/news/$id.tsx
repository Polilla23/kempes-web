import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { checkAuth } from '@/services/auth-guard'
import { NewsPostCard } from '@/components/news'
import NewsService from '@/services/news.service'
import { newsToPost } from '@/lib/news-utils'
import type { NewsPost } from '@/components/news'

export const Route = createFileRoute('/news/$id')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: NewsDetailPage,
})

function NewsDetailPage() {
  const { id } = Route.useParams()
  const [post, setPost] = useState<NewsPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await NewsService.getById(id)
        setPost(newsToPost(news))
      } catch (err: any) {
        setError(err.message || 'Error al cargar la noticia')
      } finally {
        setIsLoading(false)
      }
    }
    fetchNews()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">{error || 'Noticia no encontrada'}</p>
        <Button variant="outline" asChild>
          <Link to="/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a noticias
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a noticias
          </Link>
        </Button>
      </div>

      <NewsPostCard post={post} />
    </div>
  )
}
