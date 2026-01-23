"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const transfers = [
  { player: "Kylian Mbappé", playerSlug: "kylian-mbappe", playerInitials: "KM", position: "DEL", rating: 91, from: "PSG", fromSlug: "psg", fromLogo: "PSG", to: "Real Madrid", toSlug: "real-madrid", toLogo: "RMA", fee: "€180M", date: "Hace 2h" },
  { player: "Jude Bellingham", playerSlug: "jude-bellingham", playerInitials: "JB", position: "MC", rating: 88, from: "Dortmund", fromSlug: "borussia-dortmund", fromLogo: "BVB", to: "Real Madrid", toSlug: "real-madrid", toLogo: "RMA", fee: "€103M", date: "Hace 1d" },
  { player: "Declan Rice", playerSlug: "declan-rice", playerInitials: "DR", position: "MCD", rating: 86, from: "West Ham", fromSlug: "west-ham", fromLogo: "WHU", to: "Arsenal", toSlug: "arsenal", toLogo: "ARS", fee: "€105M", date: "Hace 2d" },
  { player: "Moises Caicedo", playerSlug: "moises-caicedo", playerInitials: "MC", position: "MC", rating: 84, from: "Brighton", fromSlug: "brighton", fromLogo: "BRI", to: "Chelsea", toSlug: "chelsea", toLogo: "CHE", fee: "€115M", date: "Hace 3d" },
  { player: "Kai Havertz", playerSlug: "kai-havertz", playerInitials: "KH", position: "DEL", rating: 83, from: "Chelsea", fromSlug: "chelsea", fromLogo: "CHE", to: "Arsenal", toSlug: "arsenal", toLogo: "ARS", fee: "€65M", date: "Hace 4d" },
  { player: "Mason Mount", playerSlug: "mason-mount", playerInitials: "MM", position: "MC", rating: 82, from: "Chelsea", fromSlug: "chelsea", fromLogo: "CHE", to: "Man United", toSlug: "manchester-united", toLogo: "MUN", fee: "€60M", date: "Hace 5d" },
  { player: "Rasmus Hojlund", playerSlug: "rasmus-hojlund", playerInitials: "RH", position: "DEL", rating: 80, from: "Atalanta", fromSlug: "atalanta", fromLogo: "ATA", to: "Man United", toSlug: "manchester-united", toLogo: "MUN", fee: "€72M", date: "Hace 6d" },
  { player: "Enzo Fernández", playerSlug: "enzo-fernandez", playerInitials: "EF", position: "MC", rating: 85, from: "Benfica", fromSlug: "benfica", fromLogo: "BEN", to: "Chelsea", toSlug: "chelsea", toLogo: "CHE", fee: "€121M", date: "Hace 1sem" },
  { player: "Mykhaylo Mudryk", playerSlug: "mykhaylo-mudryk", playerInitials: "MM", position: "EI", rating: 79, from: "Shakhtar", fromSlug: "shakhtar", fromLogo: "SHA", to: "Chelsea", toSlug: "chelsea", toLogo: "CHE", fee: "€70M", date: "Hace 1sem" },
  { player: "Cody Gakpo", playerSlug: "cody-gakpo", playerInitials: "CG", position: "EI", rating: 82, from: "PSV", fromSlug: "psv", fromLogo: "PSV", to: "Liverpool", toSlug: "liverpool", toLogo: "LIV", fee: "€45M", date: "Hace 2sem" },
]

export function TransfersSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  // Auto-scroll animation using requestAnimationFrame
  useEffect(() => {
    const speed = 0.5 // pixels per frame at 60fps

    const animate = (currentTime: number) => {
      if (isPaused || isDragging) {
        animationRef.current = requestAnimationFrame(animate)
        lastTimeRef.current = currentTime
        return
      }

      if (!scrollRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Calculate delta time for consistent speed
      const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 16.67 : 1
      lastTimeRef.current = currentTime

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const maxScroll = scrollWidth - clientWidth

      if (scrollLeft >= maxScroll - 1) {
        // Reset to beginning when reaching end
        scrollRef.current.scrollLeft = 0
      } else {
        scrollRef.current.scrollLeft += speed * deltaTime
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, isDragging])

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    if (ref) {
      ref.addEventListener("scroll", checkScroll)
      return () => ref.removeEventListener("scroll", checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
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
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeftPos - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setIsPaused(false)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Últimas Transferencias</CardTitle>
            <p className="text-sm text-muted-foreground">Mercado de fichajes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={cn("h-8 w-8 bg-transparent", !canScrollLeft && "opacity-50 cursor-not-allowed")}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn("h-8 w-8 bg-transparent", !canScrollRight && "opacity-50 cursor-not-allowed")}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 ml-2" asChild>
            <Link href="/transfers">
              Ver todo <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-3 overflow-x-auto scrollbar-hide pb-2 select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {transfers.map((transfer, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-56 group bg-secondary/50 border border-border rounded-xl p-3 hover:border-primary/50 transition-all"
            >
              {/* Player Info */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground border border-border">
                  {transfer.playerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/players/${transfer.playerSlug}`} className="text-sm font-semibold text-foreground truncate block hover:text-primary transition-colors">
                    {transfer.player}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{transfer.position}</span>
                    <span className="text-primary font-semibold">{transfer.rating}</span>
                  </div>
                </div>
              </div>

              {/* Transfer Route with Logos */}
              <div className="flex items-center justify-between gap-1 mb-2 bg-background/50 rounded-lg p-2">
                <Link href={`/team/${transfer.fromSlug}`} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                  <div className="w-7 h-7 bg-muted rounded flex items-center justify-center text-[9px] font-bold text-muted-foreground border border-border">
                    {transfer.fromLogo}
                  </div>
                </Link>
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                <Link href={`/team/${transfer.toSlug}`} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                  <div className="w-7 h-7 bg-primary/10 rounded flex items-center justify-center text-[9px] font-bold text-primary border border-primary/30">
                    {transfer.toLogo}
                  </div>
                </Link>
              </div>

              {/* Fee & Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{transfer.fee}</span>
                <span className="text-[10px] text-muted-foreground">{transfer.date}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
