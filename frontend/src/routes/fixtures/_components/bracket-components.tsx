// Bracket visualization components

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import type { KnockoutMatch, Match, BracketEdge } from './fixtures.types'
import { winnerIdForMatch } from './fixtures.utils'

// ResizeObserver exists in modern browsers
declare const ResizeObserver: {
  new (cb: () => void): { observe: (el: Element) => void; disconnect: () => void }
}

interface BracketCardProps {
  match: KnockoutMatch
  connector?: boolean
}

export function BracketCard({ match, connector = true }: BracketCardProps) {
  const winnerId = winnerIdForMatch(match)

  function TeamRow({
    club,
    goals,
    muted,
  }: {
    club: Match['homeClub'] | Match['awayClub'] | null | undefined
    goals: number
    muted: boolean
  }) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2">
          <div className="h-5 w-5 shrink-0 rounded bg-muted/60 ring-1 ring-border overflow-hidden">
            {club?.logo ? <img src={club.logo} alt="" className="h-full w-full object-contain" /> : null}
          </div>
          <div className={muted ? 'min-w-0 truncate text-[12px] text-muted-foreground' : 'min-w-0 truncate text-[12px] font-medium'}>
            {club?.name ?? 'TBD'}
          </div>
        </div>
        <div className={muted ? 'w-6 text-right text-[12px] text-muted-foreground' : 'w-6 text-right text-[12px] font-semibold'}>
          {match.status === 'JUGADO' ? goals : '–'}
        </div>
      </div>
    )
  }

  const homeMuted = !!winnerId && winnerId !== match.homeClub?.id
  const awayMuted = !!winnerId && winnerId !== match.awayClub?.id

  return (
    <div className="relative rounded-lg bg-background/70 ring-1 ring-border px-3 py-2 hover:bg-background transition-colors duration-200">
      <TeamRow club={match.homeClub} goals={match.homeClubGoals} muted={homeMuted} />
      <div className="my-1 h-px bg-border/70" />
      <TeamRow club={match.awayClub} goals={match.awayClubGoals} muted={awayMuted} />

      {match.status === 'JUGADO' ? (
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px]">Finalizado</Badge>
          <div className="text-[10px] text-muted-foreground">F{match.matchdayOrder}</div>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="outline" className="text-[10px]">Programado</Badge>
          <div className="text-[10px] text-muted-foreground">F{match.matchdayOrder}</div>
        </div>
      )}

      {connector ? (
        <>
          <div className="pointer-events-none absolute -right-4 top-1/2 h-[2px] w-4 -translate-y-1/2 bg-border" />
          <div className="pointer-events-none absolute -right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-sm border bg-background" />
        </>
      ) : null}
    </div>
  )
}

interface BracketUConnectorsProps {
  rows: number
  cellHeight?: number
}

export function BracketUConnectors({ rows, cellHeight = 12 }: BracketUConnectorsProps) {
  const totalHeight = rows * cellHeight

  type Connector = { top: number; height: number }

  const connectors: Connector[] = []
  const step = cellHeight * 12
  for (let y = step; y < totalHeight - step; y += step * 2) {
    connectors.push({ top: y, height: step })
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
      {connectors.map((c, idx) => (
        <div
          key={idx}
          className="absolute right-1 top-0 w-6"
          style={{ top: c.top, height: c.height }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/70" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-border/70" />
          <div className="absolute left-0 right-0 top-0 h-px bg-border/70" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-border/70" />
        </div>
      ))}
    </div>
  )
}

interface BracketExactConnectorsProps {
  edges: BracketEdge[]
  getEl: (id: string) => HTMLElement | null
  containerEl: HTMLElement | null
  highlight?: Set<string>
}

export function BracketExactConnectors({
  edges,
  getEl,
  containerEl,
  highlight,
}: BracketExactConnectorsProps) {
  const [paths, setPaths] = useState<Array<{ d: string; key: string; fromId: string; toId: string; x2: number; y2: number }>>([])

  useEffect(() => {
    if (!containerEl) return

    const compute = () => {
      const containerRect = containerEl.getBoundingClientRect()
      const next: Array<{ d: string; key: string; fromId: string; toId: string; x2: number; y2: number }> = []

      for (const e of edges) {
        const from = getEl(e.fromId)
        const to = getEl(e.toId)
        if (!from || !to) continue

        const a = from.getBoundingClientRect()
        const b = to.getBoundingClientRect()

        const x1 = a.right - containerRect.left
        const y1 = (a.top + a.height / 2) - containerRect.top
        const x2 = b.left - containerRect.left
        const y2 = (b.top + b.height / 2) - containerRect.top

        const mid = Math.max(24, (x2 - x1) * 0.55)
        const c1x = x1 + mid
        const c1y = y1
        const c2x = x2 - mid
        const c2y = y2
        const d = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
        next.push({ d, key: `${e.fromId}->${e.toId}`, fromId: e.fromId, toId: e.toId, x2, y2 })
      }

      setPaths(next)
    }

    compute()
    const onResize = () => compute()
    window.addEventListener('resize', onResize)

    const ro = new ResizeObserver(() => compute())
    ro.observe(containerEl)

    return () => {
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [edges, getEl, containerEl])

  if (!containerEl || paths.length === 0) return null

  return (
    <svg className="pointer-events-none absolute inset-0" aria-hidden="true">
      {paths.map((p) => (
        <g key={p.key}>
          <path
            d={p.d}
            fill="none"
            stroke={highlight && highlight.has(p.fromId) && highlight.has(p.toId) ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={highlight && highlight.has(p.fromId) && highlight.has(p.toId) ? 2.25 : 1.25}
            opacity={highlight ? (highlight.has(p.fromId) && highlight.has(p.toId) ? 0.95 : 0.14) : 0.55}
            style={{ transition: 'opacity 160ms ease, stroke 160ms ease, stroke-width 160ms ease' }}
          />
          <circle
            cx={p.x2}
            cy={p.y2}
            r={2.25}
            fill="hsl(var(--background))"
            stroke={highlight && highlight.has(p.toId) ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={1}
            opacity={highlight ? (highlight.has(p.toId) ? 0.95 : 0.25) : 0.95}
            style={{ transition: 'opacity 160ms ease, stroke 160ms ease' }}
          />
        </g>
      ))}
    </svg>
  )
}
