"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Heart, Share2, MoreHorizontal, Send, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clock, PenSquare, Check, Copy } from "lucide-react"
import type { JSX } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Comment {
  id: string
  author: string
  authorAvatar: string
  content: string
  timeAgo: string
  likes: number
}

interface NewsPost {
  id: string
  author: string
  authorAvatar: string
  authorRole: "admin" | "manager" | "user"
  content: string
  images: string[]
  tags: string[]
  timeAgo: string
  likes: number
  comments: Comment[]
  liked: boolean
  clubMentions?: { name: string; slug: string }[]
}

const newsPosts: NewsPost[] = [
  {
    id: "1",
    author: "Admin KML",
    authorAvatar: "",
    authorRole: "admin",
    content: "Se viene la Copa Kempes Temporada 8. El sorteo de grupos será este viernes a las 21hs. Todos los clubes clasificados deben confirmar participación antes del jueves. ¡Prepárense para la batalla!",
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=450&fit=crop",
    ],
    tags: ["Copa Kempes", "Anuncio Oficial"],
    timeAgo: "2h",
    likes: 24,
    comments: [
      { id: "c1", author: "xPedro_92", authorAvatar: "", content: "Vamos con todo! River va por la tercera consecutiva", timeAgo: "1h", likes: 8 },
      { id: "c2", author: "BocaFan_23", authorAvatar: "", content: "Este año es nuestro, ya van a ver", timeAgo: "45min", likes: 5 },
    ],
    liked: false,
    clubMentions: [],
  },
  {
    id: "2",
    author: "xPedro_92",
    authorAvatar: "",
    authorRole: "manager",
    content: "BOMBAZO en el mercado. Haaland llega a River Plate por $180M, la transferencia más cara de la historia de la KML. El noruego firmó contrato por 3 temporadas. Ahora sí vamos por todo.",
    images: [
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=450&fit=crop",
    ],
    tags: ["Transferencia", "River Plate"],
    timeAgo: "5h",
    likes: 67,
    comments: [
      { id: "c3", author: "RacingFan_01", authorAvatar: "", content: "Locura total, van a romper todo", timeAgo: "4h", likes: 12 },
      { id: "c4", author: "IndependienteKML", authorAvatar: "", content: "Imposible competir contra esa billetera jaja", timeAgo: "3h", likes: 9 },
      { id: "c5", author: "Admin KML", authorAvatar: "", content: "Transferencia confirmada y registrada", timeAgo: "2h", likes: 3 },
    ],
    liked: true,
    clubMentions: [{ name: "River Plate", slug: "river-plate" }],
  },
  {
    id: "3",
    author: "Admin KML",
    authorAvatar: "",
    authorRole: "admin",
    content: "Recordatorio: El plazo para jugar los partidos de la Fecha 12 vence el domingo 26 a las 23:59hs. Equipos que no jueguen serán sancionados con pérdida de puntos. Coordinense con sus rivales!",
    images: [],
    tags: ["Recordatorio", "Fecha 12"],
    timeAgo: "1d",
    likes: 15,
    comments: [],
    liked: false,
  },
  {
    id: "4",
    author: "SanLorenzoKML",
    authorAvatar: "",
    authorRole: "manager",
    content: "Partidazo anoche contra Huracán. 4-1 de visitante con hat-trick de Mbappé. El equipo está en su mejor momento, 5 victorias seguidas y escalando posiciones. Vamos Ciclón!",
    images: [
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=450&fit=crop",
    ],
    tags: ["Resultado", "San Lorenzo"],
    timeAgo: "1d",
    likes: 42,
    comments: [
      { id: "c6", author: "HuracanKML", authorAvatar: "", content: "Bien jugado, nos pasaron por arriba. Merecido", timeAgo: "23h", likes: 18 },
    ],
    liked: false,
    clubMentions: [
      { name: "San Lorenzo", slug: "san-lorenzo" },
      { name: "Huracán", slug: "huracan" },
    ],
  },
]

const tagColors: Record<string, string> = {
  "Copa Kempes": "bg-primary/15 text-primary border-primary/30",
  "Anuncio Oficial": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "Transferencia": "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  "Recordatorio": "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  "Resultado": "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  default: "bg-muted text-muted-foreground border-border",
}

const roleColors: Record<string, string> = {
  admin: "bg-red-500/15 text-red-600 dark:text-red-400",
  manager: "bg-primary/15 text-primary",
  user: "bg-muted text-muted-foreground",
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
          src={images[currentIndex] || "/placeholder.svg"} 
          alt={`Imagen ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <>
          {/* Navigation Arrows */}
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

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "bg-white w-4" 
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-3 right-3 bg-background/80 rounded-md px-2 py-1 text-xs font-medium">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  )
}

function NewsPostCard({ post }: { post: NewsPost }) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(post.liked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Noticia de Kempes Master League',
      text: post.content.substring(0, 100) + '...',
      url: `${window.location.origin}/news/${post.id}`
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
      console.log('Share cancelled or failed')
    }
  }

  // Parse content for club mentions and make them clickable
  const renderContent = () => {
    if (!post.clubMentions || post.clubMentions.length === 0) {
      return <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
    }

    let content = post.content
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0

    post.clubMentions.forEach((club, i) => {
      const index = content.indexOf(club.name, lastIndex)
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(content.slice(lastIndex, index))
        }
        parts.push(
          <Link 
            key={`${club.slug}-${i}`}
            href={`/team/${club.slug}`}
            className="text-primary font-semibold hover:underline"
          >
            {club.name}
          </Link>
        )
        lastIndex = index + club.name.length
      }
    })

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex))
    }

    return <p className="text-foreground whitespace-pre-wrap">{parts}</p>
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.authorAvatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {post.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{post.author}</span>
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", roleColors[post.authorRole])}>
                  {post.authorRole === "admin" ? "Admin" : post.authorRole === "manager" ? "Manager" : "Usuario"}
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

        {/* Post Content */}
        <div className="px-4 pb-3">
          {renderContent()}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className={cn("text-xs", tagColors[tag] || tagColors.default)}
              >
                #{tag.replace(/\s+/g, "")}
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
              className={cn("gap-2 h-8", isLiked && "text-red-500")}
              onClick={handleLike}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              <span className="text-sm">{likesCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 h-8"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments.length}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-2 h-8", shareStatus === 'copied' && "text-green-500")}
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
        {post.comments.length > 0 && (
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
                  Ver {post.comments.length} comentario{post.comments.length > 1 ? "s" : ""}
                </>
              )}
            </Button>

            {showComments && (
              <div className="p-4 pt-0 space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {comment.author.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 ml-2">
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          Me gusta ({comment.likes})
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* New Comment Input */}
                <div className="flex gap-3 pt-4 mt-2 border-t border-border/50">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">TU</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea 
                      placeholder="Escribe un comentario..."
                      className="min-h-[40px] h-10 resize-none text-sm"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button size="icon" className="h-10 w-10 shrink-0" disabled={!newComment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Comment (when no comments or comments hidden) */}
        {(!showComments || post.comments.length === 0) && (
          <div className="p-4 pt-4 mt-4 border-t border-border flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">TU</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea 
                placeholder="Escribe un comentario..."
                className="min-h-[40px] h-10 resize-none text-sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onClick={() => setShowComments(true)}
              />
              <Button size="icon" className="h-10 w-10 shrink-0" disabled={!newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function NewsFeedSection() {
  return (
    <div className="space-y-4">
      {/* Banner THE KEMPES TIMES */}
      <div className="py-6 px-4 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-center gap-4">
          <img
            src="/images/80.png"
            alt="Kempes Logo"
            className="w-12 h-12 object-contain"
          />
          <div className="text-center">
            <h1 className="font-newspaper text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              THE KEMPES TIMES
            </h1>
            <div className="w-full h-0.5 bg-foreground mt-1" />
          </div>
          <img
            src="/images/80.png"
            alt="Kempes Logo"
            className="w-12 h-12 object-contain"
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Lo último de la comunidad KML
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Noticias</h2>
          <p className="text-sm text-muted-foreground">Todas las publicaciones</p>
        </div>
        <Button asChild>
          <Link href="/news/create">
            <PenSquare className="w-4 h-4 mr-2" />
            Subir noticia
          </Link>
        </Button>
      </div>

      {/* Feed */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {newsPosts.map((post) => (
          <NewsPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" className="w-full bg-transparent">
          Cargar más publicaciones
        </Button>
      </div>
    </div>
  )
}
