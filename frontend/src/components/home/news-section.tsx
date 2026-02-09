import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Newspaper, ExternalLink, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stripNewsFormatting } from '@/lib/format-content'
import NewsService, { type News } from '@/services/news.service'

interface NewsSectionProps {
  className?: string
}

function NewsCarouselItem({ news }: { news: News }) {
  return (
    <Link to={`/news`} className="block">
      <div className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
          {news.images.length > 0 && (
            <img
              src={news.images[0]}
              alt={news.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground line-clamp-2 text-sm">{news.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{stripNewsFormatting(news.content)}</p>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(news.publishedAt).toLocaleDateString()}
              </span>
              {news.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function NewsSection({ className }: NewsSectionProps) {
  const { t } = useTranslation('home')
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const result = await NewsService.getAll({ isPublished: true }, { page: 1, limit: 5 })
        setNews(result.data)
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNews()
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? news.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === news.length - 1 ? 0 : prev + 1))
  }

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            {t('news.title')}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
            <Link to="/news">
              {t('news.viewAll')}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Newspaper className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">{t('news.noNews')}</p>
            <Button asChild className="mt-4" size="sm">
              <Link to="/news">{t('news.viewAll')}</Link>
            </Button>
          </div>
        ) : news.length <= 2 ? (
          <div className={cn('grid gap-2', news.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
            {news.map((item) => (
              <NewsCarouselItem key={item.id} news={item} />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="space-y-2">
              {news.slice(currentIndex, currentIndex + 2).map((item) => (
                <NewsCarouselItem key={item.id} news={item} />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.ceil(news.length / 2) }).map((_, i) => (
                  <button
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      Math.floor(currentIndex / 2) === i ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                    )}
                    onClick={() => setCurrentIndex(i * 2)}
                  />
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
