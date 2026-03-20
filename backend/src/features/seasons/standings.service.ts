import { Prisma, PrismaClient, MovementType, CompetitionFormat, CompetitionName, MatchStatus, CupPhase, CompetitionStage, CompetitionCategory, KnockoutRound } from '@prisma/client'
import { TeamStanding, CompetitionStandings, TopLeagueRules, MiddleLeagueRules, BottomLeagueRules, LiguillaConfig, ZoneDescription, ReducidoRound } from '@/types'

type AnyLeagueRules = TopLeagueRules | MiddleLeagueRules | BottomLeagueRules

interface TeamMovement {
  clubId: string
  clubName: string
  fromCompetitionId: string
  fromLeague: string
  toCompetitionId: string | null
  toLeague: string | null
  movementType: MovementType
  reason: string
  finalPosition: number
  category: string
}

export class StandingsService {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  /**
   * Calcula la tabla de posiciones de una competición basado en sus partidos
   * Incluye partidos FINALIZADOS y CANCELADOS (cancelados no dan puntos)
   */
  async calculateStandings(competitionId: string): Promise<CompetitionStandings> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        matches: {
          include: {
            homeClub: true,
            awayClub: true,
          },
        },
        teams: true,
        season: true,
        competitionType: true,
      },
    })

    if (!competition) {
      throw new Error('Competition not found')
    }

    // Inicializar estadísticas para cada equipo
    const stats = new Map<string, TeamStanding>()
    const initTeam = (id: string, name: string, logo?: string | null) => {
      if (!stats.has(id)) {
        stats.set(id, {
          clubId: id,
          clubName: name,
          clubLogo: logo || undefined,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          position: 0,
          zone: null,
        })
      }
    }

    // Primero intentar con teams (relación many-to-many CompetitionTeams)
    if (competition.teams.length > 0) {
      competition.teams.forEach((club) => initTeam(club.id, club.name, club.logo))
    } else {
      // Fallback: derivar equipos únicos de los matches (para competencias existentes sin teams conectados)
      competition.matches.forEach((match) => {
        if (match.homeClub) initTeam(match.homeClub.id, match.homeClub.name, match.homeClub.logo)
        if (match.awayClub) initTeam(match.awayClub.id, match.awayClub.name, match.awayClub.logo)
      })
    }

    // Filtrar partidos que cuentan para la tabla de posiciones de liga:
    // - Fase regular (ROUND_ROBIN) siempre cuenta
    // - Liguilla (KNOCKOUT con knockoutRound LIGUILLA) también cuenta para la tabla combinada
    // - Otros knockouts (TRIANGULAR, etc.) NO cuentan
    const regularMatches = competition.competitionType.format === CompetitionFormat.LEAGUE
      ? competition.matches.filter((m) =>
          m.stage === 'ROUND_ROBIN' ||
          (m.stage === CompetitionStage.KNOCKOUT && m.knockoutRound === KnockoutRound.LIGUILLA)
        )
      : competition.matches

    // Contar partidos completados (finalizados o cancelados)
    const completedMatches = regularMatches.filter(
      (m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO
    )
    const totalMatches = regularMatches.length

    // Procesar cada partido finalizado (los cancelados no dan puntos)
    regularMatches.forEach((match) => {
      if (!match.homeClub || !match.awayClub) return
      if (match.status !== MatchStatus.FINALIZADO) return  // Solo procesar finalizados

      const homeStats = stats.get(match.homeClub.id)
      const awayStats = stats.get(match.awayClub.id)

      if (!homeStats || !awayStats) return

      homeStats.played++
      awayStats.played++
      homeStats.goalsFor += match.homeClubGoals
      homeStats.goalsAgainst += match.awayClubGoals
      awayStats.goalsFor += match.awayClubGoals
      awayStats.goalsAgainst += match.homeClubGoals

      if (match.homeClubGoals > match.awayClubGoals) {
        // Victoria local
        homeStats.won++
        homeStats.points += 3
        awayStats.lost++
      } else if (match.homeClubGoals < match.awayClubGoals) {
        // Victoria visitante
        awayStats.won++
        awayStats.points += 3
        homeStats.lost++
      } else {
        // Empate
        homeStats.drawn++
        awayStats.drawn++
        homeStats.points++
        awayStats.points++
      }
    })

    // Calcular diferencia de gol y ordenar
    const standings = Array.from(stats.values()).map((stat) => ({
      ...stat,
      goalDifference: stat.goalsFor - stat.goalsAgainst,
    }))

    // Ordenar con desempate: head-to-head para 2 equipos, DG general para 3+
    this.applyTiebreakers(standings, regularMatches)

    // Asignar posiciones
    standings.forEach((standing, index) => {
      standing.position = index + 1
    })

    // Asignar zonas para ligas
    let leaguePosition: 'TOP' | 'MIDDLE' | 'BOTTOM' | null = null
    let zoneDescriptions: ZoneDescription[] = []
    if (competition.competitionType.format === CompetitionFormat.LEAGUE) {
      const rules = competition.rules as unknown as AnyLeagueRules

      // Determinar league_position: primero desde rules, fallback desde hierarchy
      let effectiveLeaguePosition: 'TOP' | 'MIDDLE' | 'BOTTOM' | null = rules?.league_position || null

      if (!effectiveLeaguePosition) {
        // Inferir league_position desde la jerarquía del competitionType
        const leagueTypes = await this.prisma.competitionType.findMany({
          where: {
            category: competition.competitionType.category,
            format: CompetitionFormat.LEAGUE,
          },
          orderBy: { hierarchy: 'asc' },
        })

        if (leagueTypes.length > 0) {
          const idx = leagueTypes.findIndex(t => t.id === competition.competitionTypeId)
          if (idx === 0) effectiveLeaguePosition = 'TOP'
          else if (idx === leagueTypes.length - 1) effectiveLeaguePosition = 'BOTTOM'
          else effectiveLeaguePosition = 'MIDDLE'
        }
      }

      if (effectiveLeaguePosition) {
        leaguePosition = effectiveLeaguePosition
        const effectiveRules = { ...rules, league_position: effectiveLeaguePosition }
        try {
          this.assignZones(standings, effectiveRules as AnyLeagueRules)
          zoneDescriptions = this.buildZoneDescriptions(standings, effectiveRules as AnyLeagueRules)
        } catch (err) {
          console.warn(`Zone assignment failed for competition ${competitionId}:`, err)
          // No crashear standings si falla zone assignment
        }
      }
    }

    // Determinar si la competición está completa
    const isComplete = completedMatches.length === totalMatches && totalMatches > 0

    // Zonas activas para leyenda dinámica
    const activeZones = [...new Set(standings.map(s => s.zone).filter(Boolean))] as string[]

    return {
      competitionId: competition.id,
      competitionName: competition.name,
      seasonNumber: competition.season.number,
      standings,
      isComplete,
      matchesPlayed: completedMatches.length,
      matchesTotal: totalMatches,
      leaguePosition,
      activeZones,
      zoneDescriptions,
    }
  }

  /**
   * Calcula solo el array de standings (para uso interno)
   */
  async calculateStandingsArray(competitionId: string): Promise<TeamStanding[]> {
    const result = await this.calculateStandings(competitionId)
    return result.standings
  }

  /**
   * Calcula los movimientos de equipos de una temporada a la siguiente
   */
  async calculateSeasonMovements(seasonId: string): Promise<TeamMovement[]> {
    const result = await this.calculateSeasonMovementsWithCache(seasonId)
    return result.movements
  }

  async calculateSeasonMovementsWithCache(seasonId: string): Promise<{ movements: TeamMovement[], standingsCache: Map<string, CompetitionStandings> }> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competitions: {
          where: {
            competitionType: {
              format: CompetitionFormat.LEAGUE,
            },
          },
          include: {
            competitionType: true,
            teams: true,
          },
        },
      },
    })

    if (!season) {
      throw new Error('Season not found')
    }

    // Ordenar ligas por jerarquía
    const leagues = season.competitions.sort(
      (a, b) => a.competitionType.hierarchy - b.competitionType.hierarchy
    )

    const movements: TeamMovement[] = []
    const processedClubs = new Set<string>()
    const standingsCache = new Map<string, CompetitionStandings>()

    for (let i = 0; i < leagues.length; i++) {
      const league = leagues[i]
      const standingsResult = await this.calculateStandings(league.id)
      standingsCache.set(league.id, standingsResult)
      const standings = standingsResult.standings
      const rules = league.rules as unknown as AnyLeagueRules

      // Campeón (solo Liga A con FIRST_PLACE)
      if (rules.league_position === 'TOP' && standings.length > 0) {
        const topRules = rules as TopLeagueRules
        if (topRules.championship.format === 'FIRST_PLACE') {
          const champion = standings[0]
          movements.push({
            clubId: champion.clubId,
            clubName: champion.clubName,
            fromCompetitionId: league.id,
            fromLeague: league.competitionType.name,
            toCompetitionId: league.id,
            toLeague: league.competitionType.name,
            movementType: MovementType.CHAMPION,
            reason: 'Campeón',
            finalPosition: 1,
            category: league.competitionType.category,
          })
          processedClubs.add(champion.clubId)
        }
      }

      // Ascensos directos (solo MIDDLE y BOTTOM, no la liga más alta)
      if (i > 0 && 'promotions' in rules) {
        const promoRules = rules as MiddleLeagueRules | BottomLeagueRules
        const directPromoQty = promoRules.promotions.direct.quantity
        if (directPromoQty > 0) {
          const upperLeague = leagues[i - 1]
          for (let j = 0; j < directPromoQty && j < standings.length; j++) {
            const team = standings[j]
            if (processedClubs.has(team.clubId)) continue

            movements.push({
              clubId: team.clubId,
              clubName: team.clubName,
              fromCompetitionId: league.id,
              fromLeague: league.competitionType.name,
              toCompetitionId: upperLeague.id,
              toLeague: upperLeague.competitionType.name,
              movementType: MovementType.DIRECT_PROMOTION,
              reason: `Posición ${team.position}`,
              finalPosition: team.position,
              category: league.competitionType.category,
            })
            processedClubs.add(team.clubId)
          }
        }
      }

      // Descensos directos (si no es la liga más baja y tiene relegations)
      if (i < leagues.length - 1 && rules.relegations) {
        const directRelQty = rules.relegations.direct.quantity
        if (directRelQty > 0) {
          const lowerLeague = leagues[i + 1]
          for (let j = 0; j < directRelQty && j < standings.length; j++) {
            const relegatedIndex = standings.length - 1 - j
            const team = standings[relegatedIndex]
            if (processedClubs.has(team.clubId)) continue

            movements.push({
              clubId: team.clubId,
              clubName: team.clubName,
              fromCompetitionId: league.id,
              fromLeague: league.competitionType.name,
              toCompetitionId: lowerLeague.id,
              toLeague: lowerLeague.competitionType.name,
              movementType: MovementType.DIRECT_RELEGATION,
              reason: `Posición ${team.position}`,
              finalPosition: team.position,
              category: league.competitionType.category,
            })
            processedClubs.add(team.clubId)
          }
        }
      }

      // Equipos que se mantienen
      standings.forEach((team) => {
        if (!processedClubs.has(team.clubId)) {
          movements.push({
            clubId: team.clubId,
            clubName: team.clubName,
            fromCompetitionId: league.id,
            fromLeague: league.competitionType.name,
            toCompetitionId: league.id,
            toLeague: league.competitionType.name,
            movementType: MovementType.STAYED,
            reason: `Posición ${team.position}`,
            finalPosition: team.position,
            category: league.competitionType.category,
          })
          processedClubs.add(team.clubId)
        }
      })
    }

    // --- Evaluar resultados de CAMPEONATO (TRIANGULAR / LIGUILLA) ---
    for (const league of leagues) {
      const cRules = league.rules as unknown as AnyLeagueRules
      if (cRules.league_position !== 'TOP') continue

      const topRules = cRules as TopLeagueRules
      if (!topRules.championship || topRules.championship.format === 'FIRST_PLACE') continue

      if (topRules.championship.format === 'TRIANGULAR') {
        const knockoutMatches = await this.prisma.match.findMany({
          where: {
            competitionId: league.id,
            stage: CompetitionStage.KNOCKOUT,
            knockoutRound: { in: [KnockoutRound.TRIANGULAR_SEMI, KnockoutRound.TRIANGULAR_FINAL] },
          },
        })

        const finalMatch = knockoutMatches.find(m => m.knockoutRound === KnockoutRound.TRIANGULAR_FINAL)
        const semiMatch = knockoutMatches.find(m => m.knockoutRound === KnockoutRound.TRIANGULAR_SEMI)

        // Solo procesar si AMBOS partidos están FINALIZADOS
        if (
          finalMatch?.status === MatchStatus.FINALIZADO &&
          semiMatch?.status === MatchStatus.FINALIZADO &&
          finalMatch.homeClubGoals !== null && finalMatch.awayClubGoals !== null &&
          semiMatch.homeClubGoals !== null && semiMatch.awayClubGoals !== null &&
          finalMatch.homeClubId && finalMatch.awayClubId &&
          semiMatch.homeClubId && semiMatch.awayClubId
        ) {
          // Final: home=1°, away=ganador semi
          const championId = finalMatch.homeClubGoals > finalMatch.awayClubGoals
            ? finalMatch.homeClubId : finalMatch.awayClubId
          const runnerUpId = finalMatch.homeClubGoals > finalMatch.awayClubGoals
            ? finalMatch.awayClubId : finalMatch.homeClubId
          // Semi: home=3°, away=2° → perdedor es 3°
          const semiLoserId = semiMatch.homeClubGoals > semiMatch.awayClubGoals
            ? semiMatch.awayClubId : semiMatch.homeClubId

          // Campeón
          const champIdx = movements.findIndex(m => m.clubId === championId)
          if (champIdx !== -1) {
            movements[champIdx].movementType = MovementType.CHAMPION
            movements[champIdx].reason = 'Campeón'
            movements[champIdx].finalPosition = 1
          }

          // Subcampeón (perdedor de la final) → posición 2
          const runnerIdx = movements.findIndex(m => m.clubId === runnerUpId)
          if (runnerIdx !== -1) {
            movements[runnerIdx].finalPosition = 2
            movements[runnerIdx].reason = 'Subcampeón'
          }

          // 3° (perdedor de la semi) → posición 3
          const thirdIdx = movements.findIndex(m => m.clubId === semiLoserId)
          if (thirdIdx !== -1) {
            movements[thirdIdx].finalPosition = 3
            movements[thirdIdx].reason = '3° Triangular'
          }
        }
      } else if (topRules.championship.format === 'LIGUILLA') {
        const liguillaConfig = topRules.championship as LiguillaConfig
        const liguillaMatches = await this.prisma.match.findMany({
          where: {
            competitionId: league.id,
            stage: CompetitionStage.KNOCKOUT,
            knockoutRound: KnockoutRound.LIGUILLA,
          },
        })

        // Verificar que todos estén completados (FINALIZADO o CANCELADO)
        const allDone = liguillaMatches.length > 0 &&
          liguillaMatches.every(m => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO)

        if (allDone) {
          const combinedStandings = standingsCache.get(league.id)!.standings

          // Identificar participantes de liguilla desde los partidos (no desde posiciones)
          const liguillaParticipantIds = new Set<string>()
          for (const match of liguillaMatches) {
            if (match.homeClubId) liguillaParticipantIds.add(match.homeClubId)
            if (match.awayClubId) liguillaParticipantIds.add(match.awayClubId)
          }

          if (liguillaConfig.keepPoints) {
            // calculateStandings() ya incluye resultados de liguilla en la tabla combinada.
            // Filtrar a participantes de liguilla y usar su orden combinado directamente.
            const liguillaStandings = combinedStandings.filter(s => liguillaParticipantIds.has(s.clubId))

            for (let pos = 0; pos < liguillaStandings.length; pos++) {
              const s = liguillaStandings[pos]
              const idx = movements.findIndex(m => m.clubId === s.clubId)
              if (idx === -1) continue

              if (pos === 0) {
                movements[idx].movementType = MovementType.CHAMPION
                movements[idx].reason = 'Campeón'
                movements[idx].finalPosition = 1
              } else {
                movements[idx].reason = pos === 1 ? 'Subcampeón' : `${pos + 1}° Liguilla`
                movements[idx].finalPosition = pos + 1
              }
            }
          } else {
            // keepPoints: false — miniTabla con solo resultados de liguilla (sin arrastrar puntos)
            const miniTable = new Map<string, { points: number; gd: number; gf: number; regPos: number }>()

            for (const clubId of liguillaParticipantIds) {
              const standing = combinedStandings.find(s => s.clubId === clubId)
              miniTable.set(clubId, {
                points: 0,
                gd: 0,
                gf: 0,
                regPos: standing ? standing.position : 999,
              })
            }

            // Acumular resultados de partidos finalizados
            for (const match of liguillaMatches) {
              if (match.status !== MatchStatus.FINALIZADO) continue
              if (!match.homeClubId || !match.awayClubId) continue
              if (match.homeClubGoals === null || match.awayClubGoals === null) continue

              const home = miniTable.get(match.homeClubId)
              const away = miniTable.get(match.awayClubId)
              if (!home || !away) continue

              home.gf += match.homeClubGoals
              home.gd += (match.homeClubGoals - match.awayClubGoals)
              away.gf += match.awayClubGoals
              away.gd += (match.awayClubGoals - match.homeClubGoals)

              if (match.homeClubGoals > match.awayClubGoals) {
                home.points += 3
              } else if (match.homeClubGoals < match.awayClubGoals) {
                away.points += 3
              } else {
                home.points += 1
                away.points += 1
              }
            }

            // Ordenar: puntos → dif gol → goles favor → posición regular
            const sorted = Array.from(miniTable.entries()).sort((a, b) => {
              if (b[1].points !== a[1].points) return b[1].points - a[1].points
              if (b[1].gd !== a[1].gd) return b[1].gd - a[1].gd
              if (b[1].gf !== a[1].gf) return b[1].gf - a[1].gf
              return a[1].regPos - b[1].regPos
            })

            // Actualizar movements con resultados de liguilla
            for (let pos = 0; pos < sorted.length; pos++) {
              const [clubId] = sorted[pos]
              const idx = movements.findIndex(m => m.clubId === clubId)
              if (idx === -1) continue

              if (pos === 0) {
                movements[idx].movementType = MovementType.CHAMPION
                movements[idx].reason = 'Campeón'
                movements[idx].finalPosition = 1
              } else {
                movements[idx].reason = pos === 1 ? 'Subcampeón' : `${pos + 1}° Liguilla`
                movements[idx].finalPosition = pos + 1
              }
            }
          }
        }
      }
    }

    // --- Evaluar resultados de PROMOCIONES ---
    const promotionComps = await this.prisma.competition.findMany({
      where: {
        seasonId,
        competitionType: {
          name: CompetitionName.PROMOTIONS,
        },
      },
      include: {
        matches: true,
        competitionType: true,
      },
    })

    for (const promoComp of promotionComps) {
      const rules = promoComp.rules as any
      const upperCompId = rules?.upperCompetitionId
      const lowerCompId = rules?.lowerCompetitionId
      if (!upperCompId || !lowerCompId) continue

      // Encontrar las ligas correspondientes
      const upperLeague = leagues.find((l) => l.id === upperCompId)
      const lowerLeague = leagues.find((l) => l.id === lowerCompId)
      if (!upperLeague || !lowerLeague) continue

      // Evaluar cada partido de promoción finalizado
      const promoMatches = promoComp.matches.filter(
        (m) => m.knockoutRound === KnockoutRound.PROMOTION && m.status === MatchStatus.FINALIZADO
      )

      for (const match of promoMatches) {
        if (match.homeClubGoals === null || match.awayClubGoals === null) continue
        if (!match.homeClubId || !match.awayClubId) continue

        const homeWins = match.homeClubGoals > match.awayClubGoals
        // Home = equipo de liga inferior, Away = equipo de liga superior
        const lowerClubId = match.homeClubId
        const upperClubId = match.awayClubId
        const lowerWins = homeWins

        if (lowerWins) {
          // Equipo inferior gana: asciende a liga superior
          const lowerMovIdx = movements.findIndex((m) => m.clubId === lowerClubId)
          if (lowerMovIdx !== -1) {
            movements[lowerMovIdx].movementType = MovementType.PLAYOFF_PROMOTION
            movements[lowerMovIdx].toCompetitionId = upperLeague.id
            movements[lowerMovIdx].toLeague = upperLeague.competitionType.name
            movements[lowerMovIdx].reason = 'Ganador de Promoción'
          }

          // Equipo superior: desciende a liga inferior
          const upperMovIdx = movements.findIndex((m) => m.clubId === upperClubId)
          if (upperMovIdx !== -1) {
            movements[upperMovIdx].movementType = MovementType.PLAYOFF_RELEGATION
            movements[upperMovIdx].toCompetitionId = lowerLeague.id
            movements[upperMovIdx].toLeague = lowerLeague.competitionType.name
            movements[upperMovIdx].reason = 'Perdedor de Promoción'
          }
        } else {
          // Equipo superior gana: ambos se mantienen (solo actualizar reason)
          const lowerMovIdx = movements.findIndex((m) => m.clubId === lowerClubId)
          if (lowerMovIdx !== -1) {
            movements[lowerMovIdx].reason = 'Perdedor de Promoción (se mantiene)'
          }
          const upperMovIdx = movements.findIndex((m) => m.clubId === upperClubId)
          if (upperMovIdx !== -1) {
            movements[upperMovIdx].reason = 'Ganador de Promoción (se mantiene)'
          }
        }
      }
    }

    return { movements, standingsCache }
  }

  /**
   * Guarda los snapshots históricos de clubes al finalizar una temporada
   */
  async saveClubHistory(seasonId: string, standingsCache?: Map<string, CompetitionStandings>, precomputedMovements?: TeamMovement[]): Promise<void> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competitions: {
          where: {
            competitionType: {
              format: CompetitionFormat.LEAGUE,
            },
          },
        },
      },
    })

    if (!season) {
      throw new Error('Season not found')
    }

    const movements = precomputedMovements || await this.calculateSeasonMovements(seasonId)
    const movementMap = new Map(
      movements.map((m) => [m.clubId, m.movementType])
    )

    const allHistoryData: Array<{
      clubId: string
      seasonId: string
      competitionId: string
      finalPosition: number
      points: number
      played: number
      won: number
      drawn: number
      lost: number
      goalsFor: number
      goalsAgainst: number
      movement: MovementType
    }> = []

    for (const competition of season.competitions) {
      const standingsResult = standingsCache?.get(competition.id)
        || await this.calculateStandings(competition.id)

      for (const standing of standingsResult.standings) {
        allHistoryData.push({
          clubId: standing.clubId,
          seasonId: seasonId,
          competitionId: competition.id,
          finalPosition: standing.position,
          points: standing.points,
          played: standing.played,
          won: standing.won,
          drawn: standing.drawn,
          lost: standing.lost,
          goalsFor: standing.goalsFor,
          goalsAgainst: standing.goalsAgainst,
          movement: movementMap.get(standing.clubId) || MovementType.STAYED,
        })
      }
    }

    if (allHistoryData.length > 0) {
      await this.prisma.clubHistory.createMany({ data: allHistoryData })
    }
  }

  /**
   * Guarda las estadísticas de jugadores al finalizar una temporada.
   * Agrupa por (playerId, clubId) para soportar transferencias mid-season.
   */
  async savePlayerStats(seasonId: string): Promise<void> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competitions: true,
        seasonHalves: true,
      },
    })

    if (!season) {
      throw new Error('Season not found')
    }

    // Pre-cargar transferencias de la temporada para determinar club del jugador por fecha
    const seasonHalfIds = season.seasonHalves.map((sh) => sh.id)
    const seasonTransfers = seasonHalfIds.length > 0
      ? await this.prisma.transfer.findMany({
          where: {
            seasonHalfId: { in: seasonHalfIds },
            status: { in: ['COMPLETED', 'ACTIVE'] },
          },
          orderBy: { createdAt: 'asc' },
        })
      : []

    // Pre-indexar transfers por playerId para O(1) lookup
    const transfersByPlayer = new Map<string, typeof seasonTransfers>()
    for (const t of seasonTransfers) {
      if (!transfersByPlayer.has(t.playerId)) {
        transfersByPlayer.set(t.playerId, [])
      }
      transfersByPlayer.get(t.playerId)!.push(t)
    }

    // Obtener TODOS los eventos de TODAS las competiciones de la temporada en una sola query
    const competitionIds = season.competitions.map((c) => c.id)
    const allEvents = await this.prisma.event.findMany({
      where: {
        match: {
          competitionId: { in: competitionIds },
          status: MatchStatus.FINALIZADO,
        },
      },
      include: {
        type: { select: { name: true } },
        player: { select: { actualClubId: true } },
        match: { select: { id: true, competitionId: true, homeClubId: true, awayClubId: true, resultRecordedAt: true } },
      },
    })

    // Agrupar eventos por competitionId
    const eventsByCompetition = new Map<string, typeof allEvents>()
    for (const event of allEvents) {
      const compId = event.match.competitionId
      if (!eventsByCompetition.has(compId)) {
        eventsByCompetition.set(compId, [])
      }
      eventsByCompetition.get(compId)!.push(event)
    }

    const allStatsData: Array<{
      playerId: string
      seasonId: string
      competitionId: string
      clubId: string
      appearances: number
      goals: number
      assists: number
      yellowCards: number
      redCards: number
      mvps: number
    }> = []

    for (const competition of season.competitions) {
      const events = eventsByCompetition.get(competition.id) || []

      // Agrupar estadísticas por (playerId, clubId)
      const playerClubStats = new Map<
        string,
        {
          appearances: Set<string>
          goals: number
          assists: number
          yellowCards: number
          redCards: number
          mvps: number
        }
      >()

      events.forEach((event) => {
        const match = event.match
        if (!match.homeClubId || !match.awayClubId) return

        // Usar transfers pre-indexados por player
        const playerTransfers = transfersByPlayer.get(event.playerId) || []

        // Determinar el club del jugador en este partido
        const clubId = this.determinePlayerClubInMatch(
          event.playerId,
          event.player.actualClubId,
          match.homeClubId,
          match.awayClubId,
          playerTransfers,
          match.resultRecordedAt
        )

        const key = `${event.playerId}:${clubId}`
        if (!playerClubStats.has(key)) {
          playerClubStats.set(key, {
            appearances: new Set(),
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            mvps: 0,
          })
        }

        const stats = playerClubStats.get(key)!
        stats.appearances.add(event.matchId)

        switch (event.type.name) {
          case 'GOAL':
            stats.goals++
            break
          case 'YELLOW_CARD':
            stats.yellowCards++
            break
          case 'RED_CARD':
            stats.redCards++
            break
          case 'MVP':
            stats.mvps++
            break
        }
      })

      // Acumular stats para batch insert
      for (const [key, stats] of playerClubStats.entries()) {
        const [playerId, clubId] = key.split(':')
        allStatsData.push({
          playerId,
          seasonId,
          competitionId: competition.id,
          clubId,
          appearances: stats.appearances.size,
          goals: stats.goals,
          assists: stats.assists,
          yellowCards: stats.yellowCards,
          redCards: stats.redCards,
          mvps: stats.mvps,
        })
      }
    }

    if (allStatsData.length > 0) {
      await this.prisma.playerSeasonStats.createMany({ data: allStatsData })
    }
  }

  /**
   * Determina el club de un jugador en un partido específico.
   * Verifica actualClubId contra los equipos del partido, y si no coincide
   * (jugador transfirió desde entonces), usa el historial de transferencias.
   */
  private determinePlayerClubInMatch(
    playerId: string,
    actualClubId: string,
    homeClubId: string,
    awayClubId: string,
    transfers: Array<{ playerId: string; fromClubId: string; toClubId: string; completedAt: Date | null; createdAt: Date }>,
    matchDate: Date | null
  ): string {
    // Caso 1: El club actual del jugador es uno de los equipos del partido
    if (actualClubId === homeClubId) return homeClubId
    if (actualClubId === awayClubId) return awayClubId

    // Caso 2: Jugador transfirió — buscar en qué club estaba al momento del partido
    const playerTransfers = transfers.filter((t) => t.playerId === playerId)
    if (playerTransfers.length === 0) return actualClubId

    if (matchDate) {
      // Buscar la transferencia más reciente ANTES del partido
      const transfersBeforeMatch = playerTransfers
        .filter((t) => {
          const transferDate = t.completedAt || t.createdAt
          return transferDate <= matchDate
        })
        .sort((a, b) => {
          const dateA = a.completedAt || a.createdAt
          const dateB = b.completedAt || b.createdAt
          return dateB.getTime() - dateA.getTime()
        })

      if (transfersBeforeMatch.length > 0) {
        const lastTransfer = transfersBeforeMatch[0]
        // Después de esta transferencia, el jugador estaba en toClubId
        if (lastTransfer.toClubId === homeClubId) return homeClubId
        if (lastTransfer.toClubId === awayClubId) return awayClubId
      }

      // Buscar la transferencia más cercana DESPUÉS del partido (el jugador se fue de uno de los clubes)
      const transfersAfterMatch = playerTransfers
        .filter((t) => {
          const transferDate = t.completedAt || t.createdAt
          return transferDate > matchDate
        })
        .sort((a, b) => {
          const dateA = a.completedAt || a.createdAt
          const dateB = b.completedAt || b.createdAt
          return dateA.getTime() - dateB.getTime()
        })

      if (transfersAfterMatch.length > 0) {
        const nextTransfer = transfersAfterMatch[0]
        // Antes de esta transferencia, el jugador estaba en fromClubId
        if (nextTransfer.fromClubId === homeClubId) return homeClubId
        if (nextTransfer.fromClubId === awayClubId) return awayClubId
      }
    }

    // Fallback: buscar cualquier transferencia que involucre a uno de los clubes del partido
    for (const t of playerTransfers) {
      if (t.fromClubId === homeClubId || t.toClubId === homeClubId) return homeClubId
      if (t.fromClubId === awayClubId || t.toClubId === awayClubId) return awayClubId
    }

    // Último fallback
    return actualClubId
  }

  /**
   * Obtiene el ranking acumulado de CoefKempes para todos los clubes
   * Suma puntos de todas las temporadas, útil para armar bombos del sorteo
   */
  async getCoefKempesRanking(): Promise<
    Array<{
      clubId: string
      clubName: string
      clubLogo: string | null
      totalPoints: number
      records: Array<{
        seasonId: string
        seasonNumber: number
        points: number
        cupPhase: string
        cupName: string
      }>
    }>
  > {
    const allRecords = await this.prisma.coefKempes.findMany({
      include: {
        club: { select: { id: true, name: true, logo: true } },
        season: { select: { id: true, number: true } },
      },
      orderBy: { season: { number: 'desc' } },
    })

    // Agrupar por club y sumar puntos
    const clubMap = new Map<
      string,
      {
        clubId: string
        clubName: string
        clubLogo: string | null
        totalPoints: number
        records: Array<{
          seasonId: string
          seasonNumber: number
          points: number
          cupPhase: string
          cupName: string
        }>
      }
    >()

    for (const record of allRecords) {
      const existing = clubMap.get(record.clubId)
      const recordData = {
        seasonId: record.seasonId,
        seasonNumber: record.season.number,
        points: record.points,
        cupPhase: record.cupPhase,
        cupName: record.cupName,
      }

      if (existing) {
        existing.totalPoints += record.points
        existing.records.push(recordData)
      } else {
        clubMap.set(record.clubId, {
          clubId: record.clubId,
          clubName: record.club.name,
          clubLogo: record.club.logo,
          totalPoints: record.points,
          records: [recordData],
        })
      }
    }

    // Ordenar por puntos totales descendente
    return Array.from(clubMap.values()).sort((a, b) => b.totalPoints - a.totalPoints)
  }

  /**
   * Calcula y guarda los coeficientes Kempes para las copas
   */
  async calculateCoefKempes(seasonId: string): Promise<void> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competitions: {
          where: {
            competitionType: {
              format: CompetitionFormat.CUP,
            },
          },
          include: {
            competitionType: true,
            teams: true,
            matches: {
              where: { status: MatchStatus.FINALIZADO },
            },
          },
        },
      },
    })

    if (!season) {
      throw new Error('Season not found')
    }

    // Sistema de puntos por fase
    const phasePoints: Record<CupPhase, number> = {
      [CupPhase.GROUPS]: 1,
      [CupPhase.ROUND_OF_16]: 2,
      [CupPhase.QUARTERFINALS]: 4,
      [CupPhase.SEMIFINALS]: 8,
      [CupPhase.FINAL]: 16,
      [CupPhase.CHAMPION]: 32,
    }

    // Ordered phase hierarchy for comparison
    const phaseOrder: CupPhase[] = [
      CupPhase.GROUPS,
      CupPhase.ROUND_OF_16,
      CupPhase.QUARTERFINALS,
      CupPhase.SEMIFINALS,
      CupPhase.FINAL,
      CupPhase.CHAMPION,
    ]

    // Map KnockoutRound → CupPhase that indicates the team reached that stage
    const knockoutToPhase: Partial<Record<KnockoutRound, CupPhase>> = {
      [KnockoutRound.ROUND_OF_64]: CupPhase.ROUND_OF_16,
      [KnockoutRound.ROUND_OF_32]: CupPhase.ROUND_OF_16,
      [KnockoutRound.ROUND_OF_16]: CupPhase.ROUND_OF_16,
      [KnockoutRound.QUARTERFINAL]: CupPhase.QUARTERFINALS,
      [KnockoutRound.SEMIFINAL]: CupPhase.SEMIFINALS,
      [KnockoutRound.THIRD_PLACE]: CupPhase.SEMIFINALS, // played for 3rd → reached semis
      [KnockoutRound.FINAL]: CupPhase.FINAL,
    }

    const allCoefData: Prisma.CoefKempesCreateManyInput[] = []

    for (const competition of season.competitions) {
      // Determinar la fase máxima alcanzada por cada equipo
      const teamPhases = new Map<string, CupPhase>()

      // Inicializar todos los equipos con GROUPS (fase mínima)
      competition.teams.forEach((club) => {
        teamPhases.set(club.id, CupPhase.GROUPS)
      })

      // Procesar cada partido finalizado para determinar la fase máxima por equipo
      for (const match of competition.matches) {
        if (!match.knockoutRound) continue // partido de fase de grupos, ya cuentan como GROUPS

        const phase = knockoutToPhase[match.knockoutRound]
        if (!phase) continue // knockout rounds no relevantes para copas (LIGUILLA, etc.)

        // Actualizar ambos equipos (local y visitante participaron en esta fase)
        const clubs = [match.homeClubId, match.awayClubId].filter(Boolean) as string[]
        for (const clubId of clubs) {
          const current = teamPhases.get(clubId) || CupPhase.GROUPS
          if (phaseOrder.indexOf(phase) > phaseOrder.indexOf(current)) {
            teamPhases.set(clubId, phase)
          }
        }
      }

      // Determinar campeón desde el partido FINAL
      const finalMatch = competition.matches.find(
        (m) => m.knockoutRound === KnockoutRound.FINAL
      )

      if (finalMatch && finalMatch.homeClubId && finalMatch.awayClubId) {
        const winnerId =
          finalMatch.homeClubGoals > finalMatch.awayClubGoals
            ? finalMatch.homeClubId
            : finalMatch.awayClubGoals > finalMatch.homeClubGoals
              ? finalMatch.awayClubId
              : null // empate (no debería pasar en una final)

        if (winnerId) {
          teamPhases.set(winnerId, CupPhase.CHAMPION)
        }
      }

      // Acumular coeficientes para batch insert
      for (const [clubId, phase] of teamPhases.entries()) {
        allCoefData.push({
          clubId,
          seasonId,
          points: phasePoints[phase],
          cupPhase: phase,
          cupName: competition.competitionType.name,
        })
      }
    }

    if (allCoefData.length > 0) {
      await this.prisma.coefKempes.createMany({ data: allCoefData })
    }
  }

  /**
   * Verifica si todos los partidos de fase de grupos de una Copa Kempes están finalizados
   * y devuelve el estado de cada grupo
   */
  async getKempesCupGroupsStatus(competitionId: string): Promise<{
    competitionId: string
    competitionName: string
    allGroupsComplete: boolean
    groups: Array<{
      groupName: string
      isComplete: boolean
      matchesPlayed: number
      matchesTotal: number
      standings: TeamStanding[]
    }>
    qualifyToGold: number
    qualifyToSilver: number
  }> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        matches: {
          include: {
            homeClub: true,
            awayClub: true,
          },
        },
        teams: true,
        season: true,
        competitionType: true,
      },
    })

    if (!competition) {
      throw new Error('Competition not found')
    }

    // Parse rules to get qualifyToGold and qualifyToSilver
    const rules = competition.rules as any
    const qualifyToGold = rules?.qualifyToGold ?? 3
    const qualifyToSilver = rules?.qualifyToSilver ?? 2

    // Group matches by groupName (stored in homePlaceholder field for group stage matches)
    const matchesByGroup = new Map<string, typeof competition.matches>()

    competition.matches.forEach((match) => {
      // In group stage, homePlaceholder contains the group name (e.g., "GROUP_A", "A")
      // Only process ROUND_ROBIN matches (group stage)
      if (match.stage !== CompetitionStage.ROUND_ROBIN) return

      const groupName = match.homePlaceholder || 'Unknown'
      if (!matchesByGroup.has(groupName)) {
        matchesByGroup.set(groupName, [])
      }
      matchesByGroup.get(groupName)!.push(match)
    })

    const groups: Array<{
      groupName: string
      isComplete: boolean
      matchesPlayed: number
      matchesTotal: number
      standings: TeamStanding[]
    }> = []

    for (const [groupName, matches] of matchesByGroup.entries()) {
      // Calculate stats for each team in this group
      const teamIds = new Set<string>()
      matches.forEach((m) => {
        if (m.homeClubId) teamIds.add(m.homeClubId)
        if (m.awayClubId) teamIds.add(m.awayClubId)
      })

      const stats = new Map<string, TeamStanding>()
      teamIds.forEach((clubId) => {
        // Buscar info del club en teams (relación m2m) o en los matches (fallback)
        const club = competition.teams.find((c) => c.id === clubId)
        const matchClub = !club
          ? matches.find((m) => m.homeClub?.id === clubId)?.homeClub
            || matches.find((m) => m.awayClub?.id === clubId)?.awayClub
          : null
        const clubInfo = club || matchClub

        if (clubInfo) {
          stats.set(clubId, {
            clubId: clubInfo.id,
            clubName: clubInfo.name,
            clubLogo: clubInfo.logo || undefined,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            position: 0,
            zone: null,
          })
        }
      })

      let matchesPlayed = 0
      const matchesTotal = matches.length

      matches.forEach((match) => {
        if (match.status === MatchStatus.FINALIZADO || match.status === MatchStatus.CANCELADO) {
          matchesPlayed++
        }

        if (match.status !== MatchStatus.FINALIZADO) return
        if (!match.homeClubId || !match.awayClubId) return

        const homeStats = stats.get(match.homeClubId)
        const awayStats = stats.get(match.awayClubId)
        if (!homeStats || !awayStats) return

        homeStats.played++
        awayStats.played++
        homeStats.goalsFor += match.homeClubGoals
        homeStats.goalsAgainst += match.awayClubGoals
        awayStats.goalsFor += match.awayClubGoals
        awayStats.goalsAgainst += match.homeClubGoals

        if (match.homeClubGoals > match.awayClubGoals) {
          homeStats.won++
          homeStats.points += 3
          awayStats.lost++
        } else if (match.homeClubGoals < match.awayClubGoals) {
          awayStats.won++
          awayStats.points += 3
          homeStats.lost++
        } else {
          homeStats.drawn++
          awayStats.drawn++
          homeStats.points++
          awayStats.points++
        }
      })

      // Calculate goal difference and sort
      const standings = Array.from(stats.values()).map((stat) => ({
        ...stat,
        goalDifference: stat.goalsFor - stat.goalsAgainst,
      }))

      standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
        return b.goalsFor - a.goalsFor
      })

      standings.forEach((standing, index) => {
        standing.position = index + 1
        // Mark zones based on qualification
        if (index < qualifyToGold) {
          standing.zone = 'gold_cup' // Clasifica a Copa de Oro
        } else if (index < qualifyToGold + qualifyToSilver) {
          standing.zone = 'silver_cup' // Clasifica a Copa de Plata
        }
      })

      const isComplete = matchesPlayed === matchesTotal && matchesTotal > 0

      groups.push({
        groupName,
        isComplete,
        matchesPlayed,
        matchesTotal,
        standings,
      })
    }

    // Sort groups by name
    groups.sort((a, b) => a.groupName.localeCompare(b.groupName))

    const allGroupsComplete = groups.length > 0 && groups.every((g) => g.isComplete)

    return {
      competitionId: competition.id,
      competitionName: competition.name,
      allGroupsComplete,
      groups,
      qualifyToGold,
      qualifyToSilver,
    }
  }

  /**
   * Obtiene los equipos clasificados de una Copa Kempes para generar Copa Oro y Copa Plata
   * Devuelve los equipos agrupados por destino (oro/plata) y ordenados por posición
   */
  async getKempesCupQualifiedTeams(competitionId: string): Promise<{
    competitionId: string
    isReady: boolean
    goldTeams: Array<{ clubId: string; clubName: string; clubLogo?: string; groupName: string; position: number }>
    silverTeams: Array<{ clubId: string; clubName: string; clubLogo?: string; groupName: string; position: number }>
  }> {
    const groupsStatus = await this.getKempesCupGroupsStatus(competitionId)

    if (!groupsStatus.allGroupsComplete) {
      return {
        competitionId,
        isReady: false,
        goldTeams: [],
        silverTeams: [],
      }
    }

    const goldTeams: Array<{ clubId: string; clubName: string; clubLogo?: string; groupName: string; position: number }> = []
    const silverTeams: Array<{ clubId: string; clubName: string; clubLogo?: string; groupName: string; position: number }> = []

    for (const group of groupsStatus.groups) {
      group.standings.forEach((standing, index) => {
        const teamInfo = {
          clubId: standing.clubId,
          clubName: standing.clubName,
          clubLogo: standing.clubLogo,
          groupName: group.groupName,
          position: standing.position,
        }

        if (index < groupsStatus.qualifyToGold) {
          goldTeams.push(teamInfo)
        } else if (index < groupsStatus.qualifyToGold + groupsStatus.qualifyToSilver) {
          silverTeams.push(teamInfo)
        }
      })
    }

    // Sort by position (1ros first, then 2dos, then 3ros, etc.)
    goldTeams.sort((a, b) => a.position - b.position)
    silverTeams.sort((a, b) => a.position - b.position)

    return {
      competitionId,
      isReady: true,
      goldTeams,
      silverTeams,
    }
  }

  /**
   * Obtiene standings usando snapshot si existe, con fallback a cálculo on-the-fly.
   * Para LEAGUE: intenta leer snapshot → si no hay, calcula y guarda snapshot.
   * Para CUP/otro: calcula directamente (sin snapshot).
   */
  async getStandingsWithSnapshot(competitionId: string): Promise<CompetitionStandings> {
    // Fast path: leer snapshot (solo existe para LEAGUE, creado por refreshStandingsSnapshot)
    const snapshot = await this.prisma.standingsSnapshot.findUnique({
      where: { competitionId },
    })

    if (snapshot) {
      const data = snapshot.data as unknown as CompetitionStandings
      // Verificar si el snapshot tiene zonas asignadas correctamente.
      // Un snapshot stale puede tener activeZones: [] y leaguePosition: null
      // (creado antes de la inferencia de league_position desde hierarchy).
      // Solo usar snapshot si leaguePosition está asignado (indica zonas calculadas).
      if (data.leaguePosition) {
        return data
      }
      // Snapshot stale o sin zonas: fall through a recalcular
    }

    // Slow path: calcular fresh (incluye inferencia de league_position y zonas)
    const standings = await this.calculateStandings(competitionId)

    // Crear/actualizar snapshot solo para LEAGUE format (fire-and-forget)
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { competitionType: true },
    })
    if (competition?.competitionType.format === CompetitionFormat.LEAGUE) {
      this.prisma.standingsSnapshot.upsert({
        where: { competitionId },
        create: { competitionId, data: standings as any },
        update: { data: standings as any },
      }).catch(() => {})
    }

    return standings
  }

  /**
   * Obtiene todas las tablas de posiciones de una temporada
   */
  async getSeasonStandings(seasonId: string): Promise<CompetitionStandings[]> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competitions: {
          where: {
            competitionType: {
              format: CompetitionFormat.LEAGUE,
            },
          },
          include: {
            competitionType: true,
          },
          orderBy: {
            competitionType: {
              hierarchy: 'asc',
            },
          },
        },
      },
    })

    if (!season) {
      throw new Error('Season not found')
    }

    // Calcular standings para cada competición
    const allStandings: CompetitionStandings[] = []
    
    for (const competition of season.competitions) {
      const standings = await this.getStandingsWithSnapshot(competition.id)
      allStandings.push(standings)
    }

    return allStandings
  }

  // ===================== TIEBREAKER LOGIC =====================

  /**
   * Aplica criterios de desempate a los standings ya ordenados por puntos
   * - 2 equipos igualados: head-to-head → h2h DG → DG general
   * - 3+ equipos igualados: DG general → GF
   */
  private applyTiebreakers(
    standings: TeamStanding[],
    matches: Array<{ homeClubId: string | null; awayClubId: string | null; homeClubGoals: number; awayClubGoals: number; status: string }>
  ): void {
    // Primero ordenar por puntos descendente
    standings.sort((a, b) => b.points - a.points)

    // Agrupar equipos consecutivos con mismos puntos y aplicar desempate
    let i = 0
    while (i < standings.length) {
      let j = i
      while (j < standings.length && standings[j].points === standings[i].points) {
        j++
      }
      const groupSize = j - i

      if (groupSize === 2) {
        // Head-to-head para exactamente 2 equipos
        const result = this.resolveHeadToHead(standings[i], standings[i + 1], matches)
        if (result > 0) {
          // Swap: standings[i+1] debería ir primero
          ;[standings[i], standings[i + 1]] = [standings[i + 1], standings[i]]
        }
      } else if (groupSize >= 3) {
        // Para 3+ equipos: ordenar por DG general, luego GF
        const subGroup = standings.slice(i, j)
        subGroup.sort((a, b) => {
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
          return b.goalsFor - a.goalsFor
        })
        for (let k = 0; k < subGroup.length; k++) {
          standings[i + k] = subGroup[k]
        }
      }
      i = j
    }
  }

  /**
   * Resuelve el desempate head-to-head entre 2 equipos
   * Retorna: negativo si teamA va primero, positivo si teamB va primero, 0 si siguen iguales
   */
  private resolveHeadToHead(
    teamA: TeamStanding,
    teamB: TeamStanding,
    matches: Array<{ homeClubId: string | null; awayClubId: string | null; homeClubGoals: number; awayClubGoals: number; status: string }>
  ): number {
    // Buscar partidos FINALIZADOS entre ambos equipos
    const h2hMatches = matches.filter(m =>
      m.status === MatchStatus.FINALIZADO &&
      ((m.homeClubId === teamA.clubId && m.awayClubId === teamB.clubId) ||
       (m.homeClubId === teamB.clubId && m.awayClubId === teamA.clubId))
    )

    if (h2hMatches.length === 0) {
      // Sin partidos entre sí, caer a DG general
      if (teamB.goalDifference !== teamA.goalDifference) return teamB.goalDifference - teamA.goalDifference
      return teamB.goalsFor - teamA.goalsFor
    }

    // Contar victorias y goles head-to-head
    let winsA = 0, winsB = 0
    let h2hGoalsA = 0, h2hGoalsB = 0

    for (const m of h2hMatches) {
      const aGoals = m.homeClubId === teamA.clubId ? m.homeClubGoals : m.awayClubGoals
      const bGoals = m.homeClubId === teamB.clubId ? m.homeClubGoals : m.awayClubGoals
      h2hGoalsA += aGoals
      h2hGoalsB += bGoals
      if (aGoals > bGoals) winsA++
      else if (bGoals > aGoals) winsB++
    }

    // Criterio 1: Partidos entre sí (quien ganó más)
    if (winsA !== winsB) return winsB - winsA

    // Criterio 2: DG de partidos entre sí (si cada uno ganó 1, o empates)
    if (h2hGoalsA !== h2hGoalsB) return h2hGoalsB - h2hGoalsA

    // Criterio 3: DG general
    if (teamB.goalDifference !== teamA.goalDifference) return teamB.goalDifference - teamA.goalDifference
    return teamB.goalsFor - teamA.goalsFor
  }

  // ===================== ZONE ASSIGNMENT =====================

  /**
   * Asigna zonas basado en las reglas reales de la liga (TOP/MIDDLE/BOTTOM)
   */
  private assignZones(standings: TeamStanding[], rules: AnyLeagueRules): void {
    // Resetear zonas
    standings.forEach(team => { team.zone = null })

    if (rules.league_position === 'TOP') {
      this.assignTopLeagueZones(standings, rules as TopLeagueRules)
    } else if (rules.league_position === 'MIDDLE') {
      this.assignMiddleLeagueZones(standings, rules as MiddleLeagueRules)
    } else if (rules.league_position === 'BOTTOM') {
      this.assignBottomLeagueZones(standings, rules as BottomLeagueRules)
    }
  }

  private assignTopLeagueZones(standings: TeamStanding[], rules: TopLeagueRules): void {
    const total = standings.length

    // Zona de campeonato (desde arriba) — null safe
    if (rules.championship) {
      if (rules.championship.format === 'FIRST_PLACE') {
        if (total > 0) standings[0].zone = 'champion'
      } else if (rules.championship.format === 'LIGUILLA') {
        const liguilla = rules.championship as LiguillaConfig
        for (let i = 0; i < Math.min(liguilla.teamsCount, total); i++) {
          standings[i].zone = 'liguilla'
        }
      } else if (rules.championship.format === 'TRIANGULAR') {
        for (let i = 0; i < Math.min(3, total); i++) {
          standings[i].zone = 'triangular'
        }
      }
    } else {
      // Default: 1er puesto es campeón
      if (total > 0) standings[0].zone = 'champion'
    }

    // Playout (posiciones específicas, 1-based)
    if (rules.playout) {
      for (const pos of rules.playout.positions) {
        const idx = pos - 1
        if (idx >= 0 && idx < total && !standings[idx].zone) {
          standings[idx].zone = 'playout'
        }
      }
    }

    // Descenso directo (desde abajo) — null safe
    const directRelQty = rules.relegations?.direct?.quantity ?? 0
    for (let i = 0; i < directRelQty && i < total; i++) {
      const idx = total - 1 - i
      if (!standings[idx].zone) {
        standings[idx].zone = 'relegation'
      }
    }

    // Promoción (descenso) - posiciones justo antes del descenso directo
    if (rules.relegations?.promotion) {
      const promoRelQty = rules.relegations.promotion.quantity
      for (let i = 0; i < promoRelQty && (total - directRelQty - 1 - i) >= 0; i++) {
        const idx = total - directRelQty - 1 - i
        if (!standings[idx].zone) {
          standings[idx].zone = 'relegation_playoff'
        }
      }
    }
  }

  private assignMiddleLeagueZones(standings: TeamStanding[], rules: MiddleLeagueRules): void {
    const total = standings.length

    // Ascenso directo (desde arriba) — null safe
    const directPromoQty = rules.promotions?.direct?.quantity ?? 0
    for (let i = 0; i < directPromoQty && i < total; i++) {
      standings[i].zone = 'promotion'
    }

    // Playoff de ascenso (siguientes posiciones)
    if (rules.promotions?.playoff) {
      const playoffPromoQty = rules.promotions.playoff.quantity
      for (let i = 0; i < playoffPromoQty && (directPromoQty + i) < total; i++) {
        standings[directPromoQty + i].zone = 'promotion_playoff'
      }
    }

    // Playout (posiciones específicas, 1-based)
    if (rules.playout) {
      for (const pos of rules.playout.positions) {
        const idx = pos - 1
        if (idx >= 0 && idx < total && !standings[idx].zone) {
          standings[idx].zone = 'playout'
        }
      }
    }

    // Descenso directo (desde abajo) — null safe
    const directRelQty = rules.relegations?.direct?.quantity ?? 0
    for (let i = 0; i < directRelQty && i < total; i++) {
      const idx = total - 1 - i
      if (!standings[idx].zone) {
        standings[idx].zone = 'relegation'
      }
    }

    // Promoción (descenso) - posiciones justo antes del descenso directo
    if (rules.relegations?.promotion) {
      const promoRelQty = rules.relegations.promotion.quantity
      for (let i = 0; i < promoRelQty && (total - directRelQty - 1 - i) >= 0; i++) {
        const idx = total - directRelQty - 1 - i
        if (!standings[idx].zone) {
          standings[idx].zone = 'relegation_playoff'
        }
      }
    }
  }

  private assignBottomLeagueZones(standings: TeamStanding[], rules: BottomLeagueRules): void {
    const total = standings.length

    // Ascenso directo (desde arriba) — null safe
    const directPromoQty = rules.promotions?.direct?.quantity ?? 0
    for (let i = 0; i < directPromoQty && i < total; i++) {
      standings[i].zone = 'promotion'
    }

    // Playoff de ascenso (siguientes posiciones)
    if (rules.promotions?.playoff) {
      const playoffPromoQty = rules.promotions.playoff.quantity
      for (let i = 0; i < playoffPromoQty && (directPromoQty + i) < total; i++) {
        standings[directPromoQty + i].zone = 'promotion_playoff'
      }
    }

    // Reducido (posiciones del reducido)
    if (rules.reducido) {
      const reducidoPositions = [
        ...rules.reducido.startPositions,
        ...rules.reducido.waitingPositions,
      ]
      for (const pos of reducidoPositions) {
        const idx = pos - 1 // posiciones son 1-based
        if (idx >= 0 && idx < total && !standings[idx].zone) {
          standings[idx].zone = 'reducido'
        }
      }
    }

    // Descenso directo (si configurado, raro en última división)
    if (rules.relegations) {
      const directRelQty = rules.relegations?.direct?.quantity ?? 0
      for (let i = 0; i < directRelQty && i < total; i++) {
        const idx = total - 1 - i
        if (!standings[idx].zone) {
          standings[idx].zone = 'relegation'
        }
      }
    }
  }

  // ============================================
  // GENERACIÓN DE DESCRIPCIONES DE ZONAS
  // ============================================

  /**
   * Construye las descripciones detalladas de zonas para la leyenda del standings.
   * Agrupa posiciones por zona y enriquece con info de reglas (playout, reducido).
   */
  private buildZoneDescriptions(standings: TeamStanding[], rules: AnyLeagueRules): ZoneDescription[] {
    // Agrupar posiciones por zona desde los standings ya asignados
    const zonePositions = new Map<string, number[]>()
    for (const s of standings) {
      if (s.zone) {
        if (!zonePositions.has(s.zone)) zonePositions.set(s.zone, [])
        zonePositions.get(s.zone)!.push(s.position)
      }
    }

    const descriptions: ZoneDescription[] = []

    for (const [zone, positions] of zonePositions) {
      const desc: ZoneDescription = {
        zone,
        positions: positions.sort((a, b) => a - b),
      }

      // Detalle de playout
      if (zone === 'playout' && 'playout' in rules && rules.playout?.loserGoesToPromotion) {
        desc.detail = 'loserGoesToPromotion'
      }

      // Detalle de reducido con rondas
      if (zone === 'reducido' && rules.league_position === 'BOTTOM') {
        const bottomRules = rules as BottomLeagueRules
        if (bottomRules.reducido) {
          desc.reducidoRounds = this.buildReducidoRounds(bottomRules.reducido)
          if (bottomRules.reducido.winnerGoesToPromotion) {
            desc.detail = 'winnerGoesToPromotion'
          }
        }
      }

      descriptions.push(desc)
    }

    // Ordenar por posición visual: de arriba (positivas) a abajo (negativas) de la tabla
    const zoneOrder = [
      'champion', 'liguilla', 'triangular',
      'promotion', 'promotion_playoff',
      'playout', 'reducido',
      'relegation_playoff', 'relegation',
    ]
    descriptions.sort((a, b) => {
      const ia = zoneOrder.indexOf(a.zone)
      const ib = zoneOrder.indexOf(b.zone)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

    return descriptions
  }

  /**
   * Construye las rondas del reducido a partir de la configuración.
   * Ej: startPositions [7,8], waitingPositions [6,5] →
   *   R1: 7° vs 8° (Semi), R2: Ganador vs 6° (Final)
   *   Si hay más rondas: Cuartos, Semi, Final
   */
  private buildReducidoRounds(config: { startPositions: [number, number]; waitingPositions: number[] }): ReducidoRound[] {
    const totalRounds = 1 + config.waitingPositions.length
    const rounds: ReducidoRound[] = []

    // Ronda inicial
    rounds.push({
      type: 'start',
      positions: config.startPositions,
      roundName: this.getReducidoRoundName(0, totalRounds),
    })

    // Rondas con equipos que esperan
    for (let i = 0; i < config.waitingPositions.length; i++) {
      rounds.push({
        type: 'waiting',
        waitingPosition: config.waitingPositions[i],
        roundName: this.getReducidoRoundName(i + 1, totalRounds),
      })
    }

    return rounds
  }

  /**
   * Determina el nombre de ronda del reducido contando hacia atrás desde la final.
   */
  private getReducidoRoundName(roundIndex: number, totalRounds: number): string {
    const fromEnd = totalRounds - 1 - roundIndex
    if (fromEnd === 0) return 'final'
    if (fromEnd === 1) return 'semifinal'
    if (fromEnd === 2) return 'quarterfinal'
    return `round${roundIndex + 1}`
  }

  /**
   * Recalcula y guarda el snapshot de standings para una competición
   * Se llama automáticamente al finalizar un partido
   */
  async refreshStandingsSnapshot(competitionId: string): Promise<void> {
    const competition = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        competitionType: true,
      },
    })

    if (!competition) return

    // Solo hacer snapshot para LEAGUE format
    if (competition.competitionType.format !== CompetitionFormat.LEAGUE) return

    // Calcular standings (ya incluye zonas para ligas)
    const standingsData = await this.calculateStandings(competitionId)

    // Upsert snapshot
    await this.prisma.standingsSnapshot.upsert({
      where: { competitionId },
      create: {
        competitionId,
        data: standingsData as any,
      },
      update: {
        data: standingsData as any,
      },
    })
  }

  /**
   * Obtiene standings de Liga A SENIOR de la temporada activa desde el snapshot
   * Fallback a cálculo on-the-fly si no hay snapshot
   */
  async getHomeStandings(): Promise<CompetitionStandings | null> {
    // Buscar temporada activa
    const activeSeason = await this.prisma.season.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) return null

    // Buscar Liga A SENIOR
    const competition = await this.prisma.competition.findFirst({
      where: {
        seasonId: activeSeason.id,
        isActive: true,
        competitionType: {
          format: CompetitionFormat.LEAGUE,
          category: CompetitionCategory.SENIOR,
          hierarchy: 1,
        },
      },
    })

    if (!competition) return null

    // Intentar leer snapshot (fast path)
    const snapshot = await this.prisma.standingsSnapshot.findUnique({
      where: { competitionId: competition.id },
    })

    if (snapshot) {
      const data = snapshot.data as unknown as CompetitionStandings
      // Solo usar snapshot si tiene leaguePosition asignado (indica zonas calculadas)
      if (data.leaguePosition) {
        return data
      }
    }

    // Fallback: calcular (ya incluye zonas) y guardar snapshot
    const standingsData = await this.calculateStandings(competition.id)

    // Guardar/actualizar para la próxima vez
    await this.prisma.standingsSnapshot.upsert({
      where: { competitionId: competition.id },
      create: {
        competitionId: competition.id,
        data: standingsData as any,
      },
      update: {
        data: standingsData as any,
      },
    }).catch(() => {})

    return standingsData
  }

  /**
   * Guarda el historial de títulos (campeones) de la temporada
   * Extrae campeones de SeasonTransition (ligas) y CoefKempes (copas)
   * y los persiste en TitleHistory para consultas rápidas
   */
  async saveTitleHistory(seasonId: string): Promise<number> {
    // League champions from SeasonTransition
    const leagueChampions = await this.prisma.seasonTransition.findMany({
      where: {
        seasonId,
        movementType: MovementType.CHAMPION,
      },
      include: {
        fromCompetition: {
          include: {
            competitionType: {
              select: { name: true, format: true, category: true },
            },
          },
        },
      },
    })

    // Cup champions from CoefKempes
    const cupChampions = await this.prisma.coefKempes.findMany({
      where: {
        seasonId,
        cupPhase: CupPhase.CHAMPION,
      },
    })

    // Build lookup for cup categories
    const cupCompTypes = await this.prisma.competitionType.findMany({
      where: { format: CompetitionFormat.CUP },
      select: { name: true, category: true },
    })
    const cupCategoryMap = new Map(cupCompTypes.map((ct) => [ct.name, ct.category]))

    const titleRecords: Prisma.TitleHistoryCreateManyInput[] = [
      ...leagueChampions.map((lc) => ({
        clubId: lc.clubId,
        seasonId,
        competitionName: lc.fromCompetition.competitionType.name,
        type: lc.fromCompetition.competitionType.format,
        category: lc.fromCompetition.competitionType.category,
      })),
      ...cupChampions.map((cc) => ({
        clubId: cc.clubId,
        seasonId,
        competitionName: cc.cupName,
        type: CompetitionFormat.CUP as any,
        category: (cupCategoryMap.get(cc.cupName) || CompetitionCategory.SENIOR) as any,
      })),
    ]

    if (titleRecords.length === 0) return 0

    const result = await this.prisma.titleHistory.createMany({
      data: titleRecords,
      skipDuplicates: true,
    })

    return result.count
  }
}
