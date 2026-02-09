import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { PenSquare, Filter, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { checkAuth } from '@/services/auth-guard'
import { NewsBanner, NewsPostCard, type NewsPost } from '@/components/news'
import NewsService from '@/services/news.service'
import { newsToPost } from '@/lib/news-utils'

export const Route = createFileRoute('/news/')({
  beforeLoad: async ({ location }) => {
    await checkAuth(location)
  },
  component: NewsPage,
})

const filterTags = ['Todas', 'Anuncio Oficial', 'Transferencia', 'Resultado', 'Copa Kempes', 'Recordatorio']

function NewsPage() {
  const [activeFilter, setActiveFilter] = useState('Todas')
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchNews = async (pageNum: number, filter: string, append = false) => {
    try {
      const filters = filter !== 'Todas' ? { tags: [filter] } : undefined
      const result = await NewsService.getAll(filters, { page: pageNum, limit: 10 })
      const mapped = result.data.map(newsToPost)

      if (append) {
        setPosts((prev) => [...prev, ...mapped])
      } else {
        setPosts(mapped)
      }
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    setPage(1)
    fetchNews(1, activeFilter).finally(() => setIsLoading(false))
  }, [activeFilter])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setIsLoadingMore(true)
    await fetchNews(nextPage, activeFilter, true)
    setPage(nextPage)
    setIsLoadingMore(false)
  }

  return (
    <div>
      {/* Banner THE KEMPES TIMES - Full width, counteract parent p-4 */}
      <NewsBanner className="-mt-4 -mx-4" />

      {/* Content container */}
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Noticias</h2>
            <p className="text-sm text-muted-foreground">Todas las publicaciones</p>
          </div>
          <Button asChild>
            <Link to="/news/create">
              <PenSquare className="w-4 h-4 mr-2" />
              Subir noticia
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {filterTags.map((tag) => (
            <Button
              key={tag}
              variant={activeFilter === tag ? 'default' : 'outline'}
              size="sm"
              className={cn('shrink-0', activeFilter !== tag && 'bg-transparent')}
              onClick={() => setActiveFilter(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay noticias para mostrar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <NewsPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Load More */}
        {!isLoading && page < totalPages && (
          <Button
            variant="outline"
            className="w-full mt-6 bg-transparent"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar más publicaciones'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
