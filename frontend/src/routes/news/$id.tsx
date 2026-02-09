import { useState, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { checkAuth } from '@/services/auth-guard'
import { NewsPostCard } from '@/components/news'
import NewsService from '@/services/news.service'
import { newsToPost } from '@/lib/news-utils'
import type { NewsPost } from '@/components/news'
import { useUser } from '@/context/UserContext'

export const Route = createFileRoute('/news/$id')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: NewsDetailPage,
})

function NewsDetailPage() {
  const { t } = useTranslation('news')
  const { id } = Route.useParams()
  const { id: currentUserId, role: currentUserRole } = useUser()
  const navigate = useNavigate()
  const [post, setPost] = useState<NewsPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      setError(t('detail.notFound'))
      setIsLoading(false)
      return
    }

    const fetchNews = async () => {
      try {
        const news = await NewsService.getById(id)
        setPost(newsToPost(news))
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('detail.loadError')
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNews()
  }, [id])

  // Dynamic page title
  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} - The Kempes Times`
    }
    return () => {
      document.title = 'Kempes Master League'
    }
  }, [post?.title])

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
        <p className="text-muted-foreground mb-4">{error || t('detail.notFound')}</p>
        <Button variant="outline" asChild>
          <Link to="/news">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('detail.backToNews')}
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
            {t('detail.backToNews')}
          </Link>
        </Button>
      </div>

      <NewsPostCard
        post={post}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onDelete={() => navigate({ to: '/news' })}
      />
    </div>
  )
}
