import type { News } from '@/services/news.service'
import type { NewsPost } from '@/components/news'
import i18n from '@/i18n/config'

export function getTimeAgo(dateString: string): string {
  const t = i18n.t.bind(i18n)
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return t('news:time.now')
  if (diffMinutes < 60) return t('news:time.minutes', { count: diffMinutes })
  if (diffHours < 24) return t('news:time.hours', { count: diffHours })
  if (diffDays < 30) return t('news:time.days', { count: diffDays })
  return t('news:time.months', { count: Math.floor(diffDays / 30) })
}

export function newsToPost(news: News): NewsPost {
  return {
    id: news.id,
    author: news.author?.username || news.author?.email?.split('@')[0] || i18n.t('news:card.anonymous'),
    authorId: news.author?.id,
    authorAvatar: news.author?.avatar || '',
    authorRole: (news.author?.role?.toLowerCase() as 'admin' | 'manager' | 'user') || 'user',
    title: news.title,
    content: news.content,
    images: news.images || [],
    tags: news.tags || [],
    timeAgo: getTimeAgo(news.publishedAt || news.createdAt),
    createdAt: news.publishedAt || news.createdAt,
    likes: news._count?.likes ?? 0,
    comments: [],
    commentsCount: news._count?.comments ?? 0,
    liked: (news.likes?.length ?? 0) > 0,
  }
}
