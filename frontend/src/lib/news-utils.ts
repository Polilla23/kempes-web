import type { News } from '@/services/news.service'
import type { NewsPost } from '@/components/news'

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'ahora'
  if (diffMinutes < 60) return `${diffMinutes}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 30) return `${diffDays}d`
  return `${Math.floor(diffDays / 30)}m`
}

export function newsToPost(news: News): NewsPost {
  return {
    id: news.id,
    author: news.author?.email?.split('@')[0] || 'Anónimo',
    authorAvatar: '',
    authorRole: (news.author?.role as 'admin' | 'manager' | 'user') || 'user',
    title: news.title,
    content: news.content,
    images: news.images || [],
    tags: news.tags || [],
    timeAgo: getTimeAgo(news.publishedAt || news.createdAt),
    likes: 0,
    comments: [],
    commentsCount: news._count?.comments ?? 0,
    liked: false,
  }
}
