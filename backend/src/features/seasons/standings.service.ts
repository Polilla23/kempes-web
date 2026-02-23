import { PrismaClient, MovementType, CompetitionFormat, MatchStatus, CupPhase, CompetitionStage } from '@prisma/client'
import { TeamStanding, CompetitionStandings } from '@/types'

interface LeagueRules {
  teamsPerLeague: number
  championDefinition: 'FIRST_PLACE' | 'PLAYOFF'
  directPromotions: number
  directRelegations: number
  playoffPromotions?: number
  playoffRelegations?: number
}

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

    // Contar partidos completados (finalizados o cancelados)
    const completedMatches = competition.matches.filter(
      (m) => m.status === MatchStatus.FINALIZADO || m.status === MatchStatus.CANCELADO
    )
    const totalMatches = competition.matches.length

    // Procesar cada partido finalizado (los cancelados no dan puntos)
    competition.matches.forEach((match) => {
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

    // Ordenar por: 1) Puntos, 2) Diferencia de gol, 3) Goles a favor
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    // Asignar posiciones
    standings.forEach((standing, index) => {
      standing.position = index + 1
    })

    // Determinar si la competición está completa
    const isComplete = completedMatches.length === totalMatches && totalMatches > 0

    return {
      competitionId: competition.id,
      competitionName: competition.name,
      seasonNumber: competition.season.number,
      standings,
      isComplete,
      matchesPlayed: completedMatches.length,
      matchesTotal: totalMatches,
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

    for (let i = 0; i < leagues.length; i++) {
      const league = leagues[i]
      const standingsResult = await this.calculateStandings(league.id)
      const standings = standingsResult.standings
      const rules = league.rules as unknown as LeagueRules

      // Campeón
      if (standings.length > 0) {
        const champion = standings[0]
        movements.push({
          clubId: champion.clubId,
          clubName: champion.clubName,
          fromCompetitionId: league.id,
          fromLeague: league.competitionType.name,
          toCompetitionId: league.id, // Se mantiene en la misma liga
          toLeague: league.competitionType.name,
          movementType: MovementType.CHAMPION,
          reason: 'Campeón',
          finalPosition: 1,
        })
        processedClubs.add(champion.clubId)
      }

      // Ascensos directos (si no es la liga más alta)
      if (i > 0 && rules.directPromotions > 0) {
        const upperLeague = leagues[i - 1]

        for (let j = 0; j < rules.directPromotions && j < standings.length; j++) {
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
          })
          processedClubs.add(team.clubId)
        }
      }

      // Descensos directos (si no es la liga más baja)
      if (i < leagues.length - 1 && rules.directRelegations > 0) {
        const lowerLeague = leagues[i + 1]

        for (let j = 0; j < rules.directRelegations && j < standings.length; j++) {
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
          })
          processedClubs.add(team.clubId)
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
          })
          processedClubs.add(team.clubId)
        }
      })
    }

    return movements
  }

  /**
   * Guarda los snapshots históricos de clubes al finalizar una temporada
   */
  async saveClubHistory(seasonId: string): Promise<void> {
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

    const movements = await this.calculateSeasonMovements(seasonId)
    const movementMap = new Map(
      movements.map((m) => [m.clubId, m.movementType])
    )

    for (const competition of season.competitions) {
      const standingsResult = await this.calculateStandings(competition.id)

      for (const standing of standingsResult.standings) {
        await this.prisma.clubHistory.create({
          data: {
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
          },
        })
      }
    }
  }

  /**
   * Guarda las estadísticas de jugadores al finalizar una temporada
   */
  async savePlayerStats(seasonId: string): Promise<void> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        competitions: true,
      },
    })

    if (!season) {
      throw new Error('Season not found')
    }

    for (const competition of season.competitions) {
      // Obtener todos los eventos de la competición
      const events = await this.prisma.event.findMany({
        where: {
          match: {
            competitionId: competition.id,
            status: MatchStatus.FINALIZADO,
          },
        },
        include: {
          type: true,
          player: true,
          match: true,
        },
      })

      // Agrupar estadísticas por jugador
      const playerStats = new Map<
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
        if (!playerStats.has(event.playerId)) {
          playerStats.set(event.playerId, {
            appearances: new Set(),
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            mvps: 0,
          })
        }

        const stats = playerStats.get(event.playerId)!
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

      // Guardar estadísticas en la BD
      for (const [playerId, stats] of playerStats.entries()) {
        await this.prisma.playerSeasonStats.create({
          data: {
            playerId,
            seasonId,
            competitionId: competition.id,
            appearances: stats.appearances.size,
            goals: stats.goals,
            assists: stats.assists,
            yellowCards: stats.yellowCards,
            redCards: stats.redCards,
            mvps: stats.mvps,
          },
        })
      }
    }
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

    for (const competition of season.competitions) {
      // Determinar la fase máxima alcanzada por cada equipo
      const teamPhases = new Map<string, CupPhase>()

      competition.teams.forEach((club) => {
        // Lógica simplificada: contar victorias en knockout
        const wins = competition.matches.filter(
          (m) =>
            m.homeClubId === club.id &&
            m.homeClubGoals > m.awayClubGoals
        ).length

        let phase: CupPhase = CupPhase.GROUPS
        if (wins >= 4) phase = CupPhase.CHAMPION
        else if (wins >= 3) phase = CupPhase.FINAL
        else if (wins >= 2) phase = CupPhase.SEMIFINALS
        else if (wins >= 1) phase = CupPhase.QUARTERFINALS
        else phase = CupPhase.ROUND_OF_16

        teamPhases.set(club.id, phase)
      })

      // Guardar coeficientes
      for (const [clubId, phase] of teamPhases.entries()) {
        await this.prisma.coefKempes.create({
          data: {
            clubId,
            seasonId,
            points: phasePoints[phase],
            cupPhase: phase,
            cupName: competition.competitionType.name,
          },
        })
      }
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
        const club = competition.teams.find((c) => c.id === clubId)
        if (club) {
          stats.set(clubId, {
            clubId: club.id,
            clubName: club.name,
            clubLogo: club.logo || undefined,
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
          standing.zone = 'promotion' // Goes to Copa de Oro
        } else if (index < qualifyToGold + qualifyToSilver) {
          standing.zone = 'playoff' // Goes to Copa de Plata
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
      const standings = await this.calculateStandings(competition.id)
      allStandings.push(standings)
    }

    return allStandings
  }
}
