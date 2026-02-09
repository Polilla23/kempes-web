import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Send,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Trash2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNewsContent } from '@/lib/format-content'
import { getTimeAgo } from '@/lib/news-utils'
import CommentService, { type CommentData } from '@/services/comment.service'

export interface Comment {
  id: string
  author: string
  authorId?: string
  authorAvatar?: string
  content: string
  timeAgo: string
  likes: number
}

export interface NewsPost {
  id: string
  author: string
  authorAvatar?: string
  authorRole: 'admin' | 'manager' | 'user'
  title?: string
  content: string
  images: string[]
  tags: string[]
  timeAgo: string
  likes: number
  comments: Comment[]
  commentsCount?: number
  liked: boolean
  clubMentions?: { name: string; slug: string }[]
}

const tagColors: Record<string, string> = {
  'Copa Kempes': 'bg-primary/15 text-primary border-primary/30',
  'Anuncio Oficial': 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Transferencia: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  Recordatorio: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  Resultado: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  default: 'bg-muted text-muted-foreground border-border',
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/15 text-red-600 dark:text-red-400',
  manager: 'bg-primary/15 text-primary',
  user: 'bg-muted text-muted-foreground',
}

function commentDataToComment(data: CommentData): Comment {
  return {
    id: data.id,
    author: data.author?.email?.split('@')[0] || 'Anónimo',
    authorId: data.authorId,
    content: data.content,
    timeAgo: getTimeAgo(data.createdAt),
    likes: 0,
  }
}

function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative group">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        <img
          src={images[currentIndex] || '/placeholder.svg'}
          alt={`Imagen ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75',
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          <div className="absolute top-3 right-3 bg-background/80 rounded-md px-2 py-1 text-xs font-medium">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  )
}

interface NewsPostCardProps {
  post: NewsPost
}

export function NewsPostCard({ post }: NewsPostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(post.liked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  // Comment state
  const [comments, setComments] = useState<Comment[]>([])
  const [totalComments, setTotalComments] = useState(post.commentsCount ?? 0)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!showComments || commentsLoaded) return
    let cancelled = false
    setIsLoadingComments(true)
    CommentService.getByNewsId(post.id)
      .then((result) => {
        if (cancelled) return
        setComments(result.data.map(commentDataToComment))
        setTotalComments(result.total)
        setCommentsLoaded(true)
      })
      .catch((error) => {
        if (!cancelled) console.error('Error fetching comments:', error)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingComments(false)
      })
    return () => { cancelled = true }
  }, [showComments, commentsLoaded, post.id])

  const handleSendComment = async () => {
    if (!newComment.trim() || isSending) return
    setIsSending(true)
    try {
      const created = await CommentService.create(post.id, newComment.trim())
      const mapped = commentDataToComment(created)
      setComments((prev) => [mapped, ...prev])
      setTotalComments((prev) => prev + 1)
      setNewComment('')
      setShowComments(true)
      setCommentsLoaded(true)
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await CommentService.delete(post.id, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setTotalComments((prev) => prev - 1)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleShare = async () => {
    const shareData = {
      title: post.title || 'Noticia de Kempes Master League',
      text: post.content.substring(0, 100) + '...',
      url: `${window.location.origin}/news/${post.id}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        setShareStatus('copied')
        setTimeout(() => setShareStatus('idle'), 2000)
      }
    } catch (error) {
      console.log('Share cancelled or failed', error)
    }
  }

  const renderContent = () => {
    let html = formatNewsContent(post.content)

    if (post.clubMentions && post.clubMentions.length > 0) {
      post.clubMentions.forEach((club) => {
        html = html.replace(
          club.name,
          `<a href="/club/${club.slug}" class="text-primary font-semibold hover:underline">${club.name}</a>`,
        )
      })
    }

    return (
      <div
        className="text-foreground whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  const commentInput = (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">TU</AvatarFallback>
      </Avatar>
      <div className="flex-1 flex gap-2">
        <Textarea
          placeholder="Escribe un comentario..."
          className="min-h-[40px] h-10 resize-none text-sm"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendComment()
            }
          }}
        />
        <Button
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={!newComment.trim() || isSending}
          onClick={handleSendComment}
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {post.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{post.author}</span>
                <Badge
                  variant="outline"
                  className={cn('text-[10px] px-1.5 py-0', roleColors[post.authorRole])}
                >
                  {post.authorRole === 'admin'
                    ? 'Admin'
                    : post.authorRole === 'manager'
                      ? 'Manager'
                      : 'Usuario'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{post.timeAgo}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Title */}
        {post.title && (
          <div className="px-4 pb-2">
            <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
          </div>
        )}

        {/* Post Content */}
        <div className="px-4 pb-3">{renderContent()}</div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn('text-xs', tagColors[tag] || tagColors.default)}
              >
                #{tag.replace(/\s+/g, '')}
              </Badge>
            ))}
          </div>
        )}

        {/* Post Images Gallery */}
        {post.images.length > 0 && (
          <div className="px-4 pb-3">
            <ImageGallery images={post.images} />
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn('gap-2 h-8', isLiked && 'text-red-500')}
              onClick={handleLike}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
              <span className="text-sm">{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 h-8"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{totalComments}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2 h-8', shareStatus === 'copied' && 'text-green-500')}
            onClick={handleShare}
          >
            {shareStatus === 'copied' ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Compartir</span>
              </>
            )}
          </Button>
        </div>

        {/* Comments Section */}
        {totalComments > 0 && (
          <div className="border-t border-border">
            <Button
              variant="ghost"
              className="w-full h-10 rounded-none text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Ocultar comentarios
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver {totalComments} comentario{totalComments > 1 ? 's' : ''}
                </>
              )}
            </Button>

            {showComments && (
              <div className="p-4 pt-0 space-y-4">
                {isLoadingComments ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {comment.author.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">
                                {comment.author}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {comment.timeAgo}
                              </span>
                            </div>
                            {comment.authorId && (
                              <AlertDialog>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>Eliminar comentario</TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Eliminar comentario</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* New Comment Input */}
                <div className="pt-4 mt-2 border-t border-border/50">{commentInput}</div>
              </div>
            )}
          </div>
        )}

        {/* Quick Comment (when no comments or comments hidden) */}
        {(!showComments || totalComments === 0) && (
          <div className="p-4 pt-4 border-t border-border">{commentInput}</div>
        )}
      </CardContent>
    </Card>
  )
}
