"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Newspaper, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const newsItems = [
  {
    id: "1",
    title: "Copa Kempes Temporada 8: Sorteo de grupos este viernes",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop",
    tags: ["Copa Kempes", "Anuncio"],
    timeAgo: "2h",
  },
  {
    id: "2",
    title: "BOMBAZO: Haaland llega a River Plate por €180M",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=200&fit=crop",
    tags: ["Transferencia"],
    timeAgo: "5h",
  },
  {
    id: "3",
    title: "San Lorenzo golea 4-1 a Huracán con hat-trick de Mbappé",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=200&fit=crop",
    tags: ["Resultado"],
    timeAgo: "1d",
  },
  {
    id: "4",
    title: "Recordatorio: Fecha 12 vence el domingo 26",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=200&fit=crop",
    tags: ["Recordatorio"],
    timeAgo: "1d",
  },
]

const tagColors: Record<string, string> = {
  "Copa Kempes": "bg-primary/90 text-primary-foreground",
  "Anuncio": "bg-amber-500/90 text-white",
  "Transferencia": "bg-green-500/90 text-white",
  "Recordatorio": "bg-orange-500/90 text-white",
  "Resultado": "bg-blue-500/90 text-white",
}

export function NewsSection() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Noticias</CardTitle>
            <p className="text-sm text-muted-foreground">Lo último de la KML</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90" asChild>
          <Link href="/news">
            Ver todas <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {newsItems.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-muted"
            >
              {/* Image */}
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className={cn("text-[10px] px-1.5 py-0", tagColors[tag] || "bg-muted text-foreground")}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-white/90 transition-colors">
                  {item.title}
                </h3>
                
                {/* Time */}
                <span className="text-[10px] text-white/70 mt-1">{item.timeAgo}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
