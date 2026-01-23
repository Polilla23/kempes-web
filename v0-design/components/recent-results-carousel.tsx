"use client"

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Zap, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface RecentResult {
  id: string
  competition: string
  competitionType: "liga" | "copa-oro" | "copa-plata" | "copa-kempes"
  homeTeam: string
  homeTeamSlug: string
  homeTeamLogo: string
  awayTeam: string
  awayTeamSlug: string
  awayTeamLogo: string
  homeScore: number
  awayScore: number
  uploadedMinutesAgo: number
}

const recentResults: RecentResult[] = [
  { id: "1", competition: "Primera División", competitionType: "liga", homeTeam: "River Plate", homeTeamSlug: "river-plate", homeTeamLogo: "RIV", awayTeam: "Boca Juniors", awayTeamSlug: "boca-juniors", awayTeamLogo: "BOC", homeScore: 2, awayScore: 1, uploadedMinutesAgo: 15 },
  { id: "2", competition: "Copa de Oro", competitionType: "copa-oro", homeTeam: "Racing Club", homeTeamSlug: "racing-club", homeTeamLogo: "RAC", awayTeam: "Independiente", awayTeamSlug: "independiente", awayTeamLogo: "IND", homeScore: 3, awayScore: 3, uploadedMinutesAgo: 45 },
  { id: "3", competition: "Copa de Plata", competitionType: "copa-plata", homeTeam: "San Lorenzo", homeTeamSlug: "san-lorenzo", homeTeamLogo: "SLO", awayTeam: "Huracán", awayTeamSlug: "huracan", awayTeamLogo: "HUR", homeScore: 1, awayScore: 4, uploadedMinutesAgo: 120 },
  { id: "4", competition: "Segunda División", competitionType: "liga", homeTeam: "Vélez Sarsfield", homeTeamSlug: "velez-sarsfield", homeTeamLogo: "VEL", awayTeam: "Estudiantes LP", awayTeamSlug: "estudiantes-lp", awayTeamLogo: "EST", homeScore: 3, awayScore: 2, uploadedMinutesAgo: 180 },
  { id: "5", competition: "Copa Kempes", competitionType: "copa-kempes", homeTeam: "River Plate", homeTeamSlug: "river-plate", homeTeamLogo: "RIV", awayTeam: "Racing Club", awayTeamSlug: "racing-club", awayTeamLogo: "RAC", homeScore: 3, awayScore: 1, uploadedMinutesAgo: 1500 },
  { id: "6", competition: "Tercera División", competitionType: "liga", homeTeam: "Argentinos Jrs", homeTeamSlug: "argentinos-juniors", homeTeamLogo: "ARG", awayTeam: "Lanús", awayTeamSlug: "lanus", awayTeamLogo: "LAN", homeScore: 0, awayScore: 2, uploadedMinutesAgo: 2880 },
  { id: "7", competition: "Primera Menores", competitionType: "liga", homeTeam: "Defensa y Just.", homeTeamSlug: "defensa-y-justicia", homeTeamLogo: "DEF", awayTeam: "Talleres", awayTeamSlug: "talleres", awayTeamLogo: "TAL", homeScore: 2, awayScore: 2, uploadedMinutesAgo: 4320 },
  { id: "8", competition: "Copa de Plata", competitionType: "copa-plata", homeTeam: "Godoy Cruz", homeTeamSlug: "godoy-cruz", homeTeamLogo: "GOD", awayTeam: "Colón", awayTeamSlug: "colon", awayTeamLogo: "COL", homeScore: 1, awayScore: 0, uploadedMinutesAgo: 10080 },
]

function formatTimeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}sem`
}

const getCompetitionStyle = (type: string) => {
  switch (type) {
    case "copa-oro":
      return { badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400", border: "border-amber-500/30 hover:border-amber-500/50" }
    case "copa-plata":
      return { badge: "bg-slate-400/15 text-slate-600 dark:text-slate-300", border: "border-slate-400/30 hover:border-slate-400/50" }
    case "copa-kempes":
      return { badge: "bg-primary/15 text-primary", border: "border-primary/30 hover:border-primary/50" }
    default:
      return { badge: "bg-muted text-muted-foreground", border: "border-border hover:border-primary/30" }
  }
}

export function RecentResultsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)

  // Triple the data for infinite scroll effect
  const infiniteResults = useMemo(() => [...recentResults, ...recentResults, ...recentResults], [])

  // Auto-scroll with requestAnimationFrame - infinite loop
  useEffect(() => {
    if (isPaused || isDragging) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const speed = 0.5

    const animate = () => {
      if (!scrollRef.current) return

      const { scrollLeft, scrollWidth } = scrollRef.current
      const singleSetWidth = scrollWidth / 3

      // Reset to middle set when reaching end or beginning
      if (scrollLeft >= singleSetWidth * 2) {
        scrollRef.current.scrollLeft = singleSetWidth
      } else if (scrollLeft <= 0) {
        scrollRef.current.scrollLeft = singleSetWidth
      } else {
        scrollRef.current.scrollLeft += speed
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start from middle set
    if (scrollRef.current) {
      const singleSetWidth = scrollRef.current.scrollWidth / 3
      scrollRef.current.scrollLeft = singleSetWidth
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPaused, isDragging])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftPos(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = scrollLeftPos - (x - startX) * 1.5
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-foreground">Últimos Resultados</CardTitle>
            <p className="text-sm text-muted-foreground">Partidos subidos recientemente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => scroll("left")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => scroll("right")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div
          ref={scrollRef}
          className={cn("flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 select-none", isDragging ? "cursor-grabbing" : "cursor-grab")}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => { setIsDragging(false); setIsPaused(false) }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
        >
          {infiniteResults.map((result, index) => {
            const style = getCompetitionStyle(result.competitionType)
            const homeWin = result.homeScore > result.awayScore
            const awayWin = result.awayScore > result.homeScore
            const isDraw = result.homeScore === result.awayScore

            return (
              <div key={`${result.id}-${index}`} className="flex-shrink-0 w-64">
                <div className={cn("bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg", style.border)}>
                  <div className="px-4 py-2.5 flex items-center justify-between border-b border-border/50">
                    <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md", style.badge)}>
                      <Trophy className="w-3 h-3" />
                      <span>{result.competition}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(result.uploadedMinutesAgo)}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Link href={`/team/${result.homeTeamSlug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">{result.homeTeamLogo}</div>
                        <span className={cn("text-sm font-medium hover:text-primary transition-colors", homeWin ? "text-foreground font-semibold" : "text-muted-foreground")}>{result.homeTeam}</span>
                      </Link>
                      <span className={cn("text-lg font-bold tabular-nums w-6 text-center", homeWin ? "text-green-600 dark:text-green-400" : isDraw ? "text-foreground" : "text-muted-foreground")}>{result.homeScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link href={`/team/${result.awayTeamSlug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">{result.awayTeamLogo}</div>
                        <span className={cn("text-sm font-medium hover:text-primary transition-colors", awayWin ? "text-foreground font-semibold" : "text-muted-foreground")}>{result.awayTeam}</span>
                      </Link>
                      <span className={cn("text-lg font-bold tabular-nums w-6 text-center", awayWin ? "text-green-600 dark:text-green-400" : isDraw ? "text-foreground" : "text-muted-foreground")}>{result.awayScore}</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Link href={`/match/${result.id}`} className="block w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors py-2 rounded-md hover:bg-primary/5" onClick={(e) => e.stopPropagation()}>Ver detalles</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-center items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Actualizando en vivo</span>
        </div>
      </CardContent>
    </Card>
  )
}
