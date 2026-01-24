import { useState, useEffect, useMemo } from 'react'
import { FixtureService } from '@/services/fixture.service'
import type {
  BracketMatch,
  BracketRound,
  CompetitionOption,
  ViewMode,
} from '../_types/fixtures.types'
import { ROUND_ORDER, ROUND_LABELS } from '../_types/fixtures.types'

export function useBracketData(
  competitions: CompetitionOption[],
  viewMode: ViewMode
) {
  const [activeCup, setActiveCup] = useState<string>('')
  const [knockoutMatches, setKnockoutMatches] = useState<BracketMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar competencias que tienen bracket knockout (cups)
  const cupCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      if (comp.format !== 'CUP') return false
      // Excluir Copa Kempes principal (solo tiene grupos, no knockout directo)
      const name = comp.name.toLowerCase()
      if (name.includes('kempes') && !name.includes('oro') && !name.includes('plata')) {
        return false
      }
      return true
    })
  }, [competitions])

  // Establecer copa activa inicial
  useEffect(() => {
    if (cupCompetitions.length > 0 && !activeCup) {
      setActiveCup(cupCompetitions[0].id)
    }
  }, [cupCompetitions, activeCup])

  // Cargar partidos knockout cuando cambia la copa activa
  useEffect(() => {
    if (!activeCup || viewMode !== 'bracket') {
      setKnockoutMatches([])
      return
    }

    const loadKnockoutMatches = async () => {
      setIsLoading(true)
      try {
        const matches = await FixtureService.getKnockoutBracket(activeCup)
        setKnockoutMatches(matches as BracketMatch[])
      } catch (err) {
        console.error('Error loading knockout matches:', err)
        setKnockoutMatches([])
      } finally {
        setIsLoading(false)
      }
    }

    loadKnockoutMatches()
  }, [activeCup, viewMode])

  // Transformar partidos en rondas de bracket
  const bracketData = useMemo((): BracketRound[] => {
    if (knockoutMatches.length === 0) return []

    const rounds: Record<string, BracketMatch[]> = {}

    knockoutMatches.forEach((match) => {
      const round = match.knockoutRound || 'UNKNOWN'
      if (!rounds[round]) {
        rounds[round] = []
      }

      // Determinar ganador
      let winner: 'home' | 'away' | 'draw' | undefined
      if (match.status === 'FINALIZADO') {
        if (match.homeClubGoals > match.awayClubGoals) winner = 'home'
        else if (match.awayClubGoals > match.homeClubGoals) winner = 'away'
        else winner = 'draw'
      }

      rounds[round].push({ ...match, winner })
    })

    // Ordenar rondas según ROUND_ORDER
    return ROUND_ORDER.filter((r) => rounds[r] && rounds[r].length > 0).map((r) => ({
      name: ROUND_LABELS[r] || r,
      roundKey: r,
      matches: rounds[r].sort((a, b) => a.matchdayOrder - b.matchdayOrder),
    }))
  }, [knockoutMatches])

  // Copa actual seleccionada
  const currentCup = useMemo(() => {
    return cupCompetitions.find((c) => c.id === activeCup)
  }, [cupCompetitions, activeCup])

  return {
    cupCompetitions,
    activeCup,
    setActiveCup,
    bracketData,
    isLoading,
    currentCup,
  }
}
