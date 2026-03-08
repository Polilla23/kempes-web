import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from 'react-i18next'
import { FormationSelector } from './formation-selector'
import type { DashboardPlayer } from '@/services/dashboard.service'

const POSITION_GROUPS: Record<string, string[]> = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  MID: ['CDM', 'CM', 'CAM', 'LM', 'RM'],
  FWD: ['LW', 'RW', 'CF', 'ST'],
}

function parseFormation(formation: string): { GK: number; DEF: number; MID: number; FWD: number } {
  const parts = formation.split('-').map(Number)
  if (parts.length === 3) {
    return { GK: 1, DEF: parts[0], MID: parts[1], FWD: parts[2] }
  }
  if (parts.length === 4) {
    // e.g. 4-2-3-1 → DEF=4, MID=2+3=5, FWD=1
    return { GK: 1, DEF: parts[0], MID: parts[1] + parts[2], FWD: parts[3] }
  }
  return { GK: 1, DEF: 4, MID: 3, FWD: 3 }
}

function assignPlayersToFormation(
  players: DashboardPlayer[],
  formation: string
): { gk: DashboardPlayer[]; def: DashboardPlayer[]; mid: DashboardPlayer[]; fwd: DashboardPlayer[] } {
  const slots = parseFormation(formation)
  const sorted = [...players].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
  const used = new Set<string>()

  function pick(group: string, count: number): DashboardPlayer[] {
    const groupPositions = POSITION_GROUPS[group]
    // First pick by position group
    const byPosition = sorted.filter(
      (p) => !used.has(p.id) && p.position && groupPositions.includes(p.position)
    )
    const result: DashboardPlayer[] = byPosition.slice(0, count)
    // Fill remaining slots with any unassigned player
    if (result.length < count) {
      const remaining = sorted.filter((p) => !used.has(p.id) && !result.includes(p))
      result.push(...remaining.slice(0, count - result.length))
    }
    result.forEach((p) => used.add(p.id))
    return result
  }

  const gk = pick('GK', slots.GK)
  const def = pick('DEF', slots.DEF)
  const mid = pick('MID', slots.MID)
  const fwd = pick('FWD', slots.FWD)

  return { gk, def, mid, fwd }
}

interface PlayerCardProps {
  player: DashboardPlayer
}

function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 group cursor-default">
      <div className="relative">
        <Avatar className="h-10 w-10 border-2 border-white/30 shadow-lg">
          <AvatarImage src={player.avatar ?? undefined} alt={player.fullName} />
          <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
            {player.fullName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-1 -right-1 bg-black/80 text-white text-[9px] font-bold rounded px-1 leading-tight">
          {player.overall ?? '?'}
        </span>
      </div>
      <div className="bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 max-w-[72px]">
        <p className="text-white text-[10px] font-semibold truncate text-center leading-tight">
          {player.fullName}
        </p>
        {player.position && (
          <p className="text-white/60 text-[9px] text-center leading-tight">{player.position}</p>
        )}
      </div>
    </div>
  )
}

interface PlayerRowProps {
  players: DashboardPlayer[]
}

function PlayerRow({ players }: PlayerRowProps) {
  if (players.length === 0) return null
  return (
    <div className="flex items-center justify-around w-full px-2">
      {players.map((p) => (
        <PlayerCard key={p.id} player={p} />
      ))}
    </div>
  )
}

interface FootballPitchProps {
  players: DashboardPlayer[]
  formation: string
  onFormationChange: (f: string) => void
}

export function FootballPitch({ players, formation, onFormationChange }: FootballPitchProps) {
  const { t } = useTranslation('dashboard')
  const [currentFormation, setCurrentFormation] = useState(formation)

  const handleFormationChange = (f: string) => {
    setCurrentFormation(f)
    onFormationChange(f)
  }

  const { gk, def, mid, fwd } = assignPlayersToFormation(players, currentFormation)

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-md">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary text-base">⚽</span>
          </div>
          <span className="font-semibold text-foreground">{t('pitch.title')}</span>
        </div>
        <FormationSelector currentFormation={currentFormation} onFormationChange={handleFormationChange} />
      </div>

      {/* The pitch */}
      <div className="relative bg-emerald-700 w-full" style={{ minHeight: '420px' }}>
        {/* Pitch markings */}
        <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none py-4">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/20" />
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
          {/* Top penalty area */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-12 border-2 border-white/20" />
          {/* Bottom penalty area */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-12 border-2 border-white/20" />
        </div>

        {/* Players — from top (FWD) to bottom (GK) */}
        <div className="relative z-10 flex flex-col justify-between h-full py-6 gap-2" style={{ minHeight: '420px' }}>
          <PlayerRow players={fwd} />
          <PlayerRow players={mid} />
          <PlayerRow players={def} />
          <PlayerRow players={gk} />
        </div>
      </div>
    </div>
  )
}
