"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  PenSquare,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Comment {
  id: string
  author: string
  content: string
  timeAgo: string
  likes: number
}

interface NewsPost {
  id: string
  author: string
  authorRole: "admin" | "manager" | "user"
  title?: string
  content: string
  tags: string[]
  timeAgo: string
  likes: number
  comments: Comment[]
  liked: boolean
}

const allPosts: NewsPost[] = [
  {
    id: "1",
    author: "Admin KML",
    authorRole: "admin",
    title: "Copa Kempes Temporada 8 - Sorteo de grupos",
    content: "Se viene la Copa Kempes Temporada 8. El sorteo de grupos será este viernes a las 21hs. Todos los clubes clasificados deben confirmar participación antes del jueves. ¡Prepárense para la batalla!",
    tags: ["Copa Kempes", "Anuncio Oficial"],
    timeAgo: "2h",
    likes: 24,
    comments: [
      { id: "c1", author: "xPedro_92", content: "Vamos con todo! River va por la tercera consecutiva", timeAgo: "1h", likes: 8 },
      { id: "c2", author: "BocaFan_23", content: "Este año es nuestro, ya van a ver", timeAgo: "45min", likes: 5 },
    ],
    liked: false,
  },
  {
    id: "2",
    author: "xPedro_92",
    authorRole: "manager",
    title: "BOMBAZO: Haaland a River Plate",
    content: "Haaland llega a River Plate por $180M, la transferencia más cara de la historia de la KML. El noruego firmó contrato por 3 temporadas. Ahora sí vamos por todo.",
    tags: ["Transferencia", "River Plate"],
    timeAgo: "5h",
    likes: 67,
    comments: [
      { id: "c3", author: "RacingFan_01", content: "Locura total, van a romper todo", timeAgo: "4h", likes: 12 },
      { id: "c4", author: "IndependienteKML", content: "Imposible competir contra esa billetera jaja", timeAgo: "3h", likes: 9 },
    ],
    liked: true,
  },
  {
    id: "3",
    author: "Admin KML",
    authorRole: "admin",
    content: "Recordatorio: El plazo para jugar los partidos de la Fecha 12 vence el domingo 26 a las 23:59hs. Equipos que no jueguen serán sancionados con pérdida de puntos. Coordinense con sus rivales!",
    tags: ["Recordatorio", "Fecha 12"],
    timeAgo: "1d",
    likes: 15,
    comments: [],
    liked: false,
  },
  {
    id: "4",
    author: "SanLorenzoKML",
    authorRole: "manager",
    title: "Partidazo contra Huracán",
    content: "4-1 de visitante con hat-trick de Mbappé. El equipo está en su mejor momento, 5 victorias seguidas y escalando posiciones. Vamos Ciclón!",
    tags: ["Resultado", "San Lorenzo"],
    timeAgo: "1d",
    likes: 42,
    comments: [
      { id: "c6", author: "HuracanKML", content: "Bien jugado, nos pasaron por arriba. Merecido", timeAgo: "23h", likes: 18 },
    ],
    liked: false,
  },
  {
    id: "5",
    author: "Admin KML",
    authorRole: "admin",
    title: "Nuevas reglas Temporada 8",
    content: "Se implementaron cambios importantes:\n\n1. Tope salarial: $500M por temporada\n2. Máximo 3 préstamos activos\n3. Clausulas de rescisión obligatorias\n4. Período de mercado reducido a 2 semanas\n\nLean el reglamento completo en la sección de reglas.",
    tags: ["Anuncio Oficial", "Reglas"],
    timeAgo: "2d",
    likes: 89,
    comments: [
      { id: "c7", author: "VelezKML", content: "Muy buenas las nuevas reglas, más competitivo", timeAgo: "2d", likes: 24 },
      { id: "c8", author: "RacingFan_01", content: "El tope salarial era necesario", timeAgo: "2d", likes: 31 },
    ],
    liked: true,
  },
]

const tagColors: Record<string, string> = {
  "Copa Kempes": "bg-primary/15 text-primary border-primary/30",
  "Anuncio Oficial": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "Transferencia": "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  "Recordatorio": "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  "Resultado": "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "Reglas": "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  default: "bg-muted text-muted-foreground border-border",
}

const roleColors: Record<string, string> = {
  admin: "bg-red-500/15 text-red-600 dark:text-red-400",
  manager: "bg-primary/15 text-primary",
  user: "bg-muted text-muted-foreground",
}

const filterTags = ["Todas", "Anuncio Oficial", "Transferencia", "Resultado", "Copa Kempes", "Recordatorio"]

function NewsPostCard({ post }: { post: NewsPost }) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(post.liked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
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
          {post.title && (
            <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
          )}
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className={cn("text-xs cursor-pointer hover:opacity-80", tagColors[tag] || tagColors.default)}
              >
                #{tag.replace(/\s+/g, "")}
              </Badge>
            ))}
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
          <Button variant="ghost" size="sm" className="gap-2 h-8">
            <Share2 className="w-4 h-4" />
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
              </div>
            )}
          </div>
        )}

        {/* Comment Input */}
        <div className="p-4 pt-0 flex gap-3 border-t border-border mt-0">
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
      </CardContent>
    </Card>
  )
}

export function NewsPageContent() {
  const [activeFilter, setActiveFilter] = useState("Todas")

  const filteredPosts = activeFilter === "Todas" 
    ? allPosts 
    : allPosts.filter(post => post.tags.includes(activeFilter))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Noticias</h1>
          <p className="text-sm text-muted-foreground">Lo último de la comunidad KML</p>
        </div>
        <Button asChild>
          <Link href="/news/create">
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
            variant={activeFilter === tag ? "default" : "outline"}
            size="sm"
            className={cn("shrink-0", activeFilter !== tag && "bg-transparent")}
            onClick={() => setActiveFilter(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <NewsPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <Button variant="outline" className="w-full mt-6 bg-transparent">
        Cargar más publicaciones
      </Button>
    </div>
  )
}
