import { PlazoRepository } from '@/features/plazos/plazos.repository'
import { PlazoNotFoundError, DuplicatePlazoOrderError, InvalidPlazoScopeError } from '@/features/plazos/plazos.errors'
import { Validator } from '@/features/utils/validation'

interface PlazoScopeInput {
  competitionId: string
  matchdayFrom?: number | null
  matchdayTo?: number | null
  knockoutRounds?: string[]
}

interface CreatePlazoInput {
  seasonHalfId: string
  title: string
  deadline: string
  order: number
  isOpen?: boolean
  scopes: PlazoScopeInput[]
}

interface UpdatePlazoInput {
  title?: string
  deadline?: string
  order?: number
  scopes?: PlazoScopeInput[]
}

export class PlazoService {
  private plazoRepository: PlazoRepository

  constructor({ plazoRepository }: { plazoRepository: PlazoRepository }) {
    this.plazoRepository = plazoRepository
  }

  async getBySeasonHalfId(seasonHalfId: string) {
    const validId = Validator.uuid(seasonHalfId)
    const plazos = await this.plazoRepository.findBySeasonHalfId(validId)
    return plazos.map((p: any) => this.enrichPlazoStats(p))
  }

  async getBySeason(seasonId: string) {
    const validId = Validator.uuid(seasonId)
    const plazos = await this.plazoRepository.findBySeasonId(validId)
    return plazos.map((p: any) => this.enrichPlazoStats(p))
  }

  async getById(id: string) {
    const validId = Validator.uuid(id)
    const plazo = await this.plazoRepository.findOneById(validId)
    if (!plazo) throw new PlazoNotFoundError()
    return this.enrichPlazoStats(plazo as any)
  }

  async create(input: CreatePlazoInput) {
    const validSeasonHalfId = Validator.uuid(input.seasonHalfId)
    const validTitle = Validator.string(input.title, 1, 200)
    const validDeadline = new Date(input.deadline)
    if (isNaN(validDeadline.getTime())) throw new Error('Invalid date format')

    this.validateScopes(input.scopes)

    try {
      const plazo = await this.plazoRepository.save({
        seasonHalfId: validSeasonHalfId,
        title: validTitle,
        deadline: validDeadline,
        order: input.order,
        isOpen: input.isOpen ?? false,
        scopes: input.scopes.map((s) => ({
          competitionId: Validator.uuid(s.competitionId),
          matchdayFrom: s.matchdayFrom ?? null,
          matchdayTo: s.matchdayTo ?? null,
          knockoutRounds: s.knockoutRounds || [],
        })),
      })

      // Auto-assign matches
      await this.autoAssignMatches(plazo.id)

      return await this.plazoRepository.findOneById(plazo.id)
    } catch (error: any) {
      if (error.code === 'P2002') throw new DuplicatePlazoOrderError()
      throw error
    }
  }

  async update(id: string, input: UpdatePlazoInput) {
    const validId = Validator.uuid(id)

    const existing = await this.plazoRepository.findOneById(validId)
    if (!existing) throw new PlazoNotFoundError()

    const updateData: any = {}

    if (input.title !== undefined) updateData.title = Validator.string(input.title, 1, 200)
    if (input.deadline !== undefined) {
      const validDeadline = new Date(input.deadline)
      if (isNaN(validDeadline.getTime())) throw new Error('Invalid date format')
      updateData.deadline = validDeadline
    }
    if (input.order !== undefined) updateData.order = input.order

    if (input.scopes !== undefined) {
      this.validateScopes(input.scopes)
      updateData.scopes = input.scopes.map((s) => ({
        competitionId: Validator.uuid(s.competitionId),
        matchdayFrom: s.matchdayFrom ?? null,
        matchdayTo: s.matchdayTo ?? null,
        knockoutRounds: s.knockoutRounds || [],
      }))
    }

    try {
      await this.plazoRepository.updateOneById(validId, updateData)

      // Re-assign matches
      await this.plazoRepository.clearMatchAssignments(validId)
      await this.autoAssignMatches(validId)

      return await this.plazoRepository.findOneById(validId)
    } catch (error: any) {
      if (error.code === 'P2002') throw new DuplicatePlazoOrderError()
      throw error
    }
  }

  async delete(id: string) {
    const validId = Validator.uuid(id)

    const existing = await this.plazoRepository.findOneById(validId)
    if (!existing) throw new PlazoNotFoundError()

    await this.plazoRepository.clearMatchAssignments(validId)
    return await this.plazoRepository.deleteOneById(validId)
  }

  async autoAssignMatches(plazoId: string) {
    const plazo = await this.plazoRepository.findOneById(plazoId)
    if (!plazo) throw new PlazoNotFoundError()

    const allMatchIds: string[] = []

    for (const scope of plazo.scopes) {
      const matches = await this.plazoRepository.getMatchesForScope(
        scope.competitionId,
        scope.matchdayFrom,
        scope.matchdayTo,
        scope.knockoutRounds as string[]
      )
      allMatchIds.push(...matches.map((m) => m.id))
    }

    if (allMatchIds.length > 0) {
      await this.plazoRepository.assignMatchesToPlazo(plazoId, allMatchIds)
    }

    return allMatchIds.length
  }

  async reassignAll(seasonHalfId: string) {
    const validId = Validator.uuid(seasonHalfId)
    const plazos = await this.plazoRepository.findBySeasonHalfId(validId)

    let totalAssigned = 0
    for (const plazo of plazos) {
      await this.plazoRepository.clearMatchAssignments(plazo.id)
      const count = await this.autoAssignMatches(plazo.id)
      totalAssigned += count
    }

    return { plazosProcessed: plazos.length, matchesAssigned: totalAssigned }
  }

  async toggleOpen(id: string, isOpen: boolean) {
    const validId = Validator.uuid(id)
    const existing = await this.plazoRepository.findOneById(validId)
    if (!existing) throw new PlazoNotFoundError()
    return await this.plazoRepository.updateIsOpen(validId, isOpen)
  }

  async getOverdueReport(seasonId: string) {
    const validId = Validator.uuid(seasonId)
    return await this.plazoRepository.getOverdueReport(validId)
  }

  async getOverdueReportByClub(seasonId: string) {
    const validId = Validator.uuid(seasonId)
    const plazos = await this.plazoRepository.getOverdueReport(validId)

    const clubMap = new Map<string, {
      club: { id: string; name: string; logo: string | null }
      totalOverdue: number
      plazos: Array<{
        plazoId: string
        title: string
        deadline: Date
        matches: Array<{
          id: string
          rival: { id: string; name: string; logo: string | null }
          competition: string
          matchdayOrder: number
          isHome: boolean
        }>
      }>
    }>()

    for (const plazo of plazos) {
      for (const match of plazo.matches as any[]) {
        const homeClub = match.homeClub
        const awayClub = match.awayClub
        const competitionName = match.competition?.name || ''

        // Add entry for home club
        if (homeClub) {
          if (!clubMap.has(homeClub.id)) {
            clubMap.set(homeClub.id, { club: homeClub, totalOverdue: 0, plazos: [] })
          }
          const entry = clubMap.get(homeClub.id)!
          entry.totalOverdue++
          let plazoEntry = entry.plazos.find((p) => p.plazoId === plazo.id)
          if (!plazoEntry) {
            plazoEntry = { plazoId: plazo.id, title: plazo.title, deadline: plazo.deadline, matches: [] }
            entry.plazos.push(plazoEntry)
          }
          plazoEntry.matches.push({
            id: match.id,
            rival: awayClub || { id: '', name: 'TBD', logo: null },
            competition: competitionName,
            matchdayOrder: match.matchdayOrder,
            isHome: true,
          })
        }

        // Add entry for away club
        if (awayClub) {
          if (!clubMap.has(awayClub.id)) {
            clubMap.set(awayClub.id, { club: awayClub, totalOverdue: 0, plazos: [] })
          }
          const entry = clubMap.get(awayClub.id)!
          entry.totalOverdue++
          let plazoEntry = entry.plazos.find((p) => p.plazoId === plazo.id)
          if (!plazoEntry) {
            plazoEntry = { plazoId: plazo.id, title: plazo.title, deadline: plazo.deadline, matches: [] }
            entry.plazos.push(plazoEntry)
          }
          plazoEntry.matches.push({
            id: match.id,
            rival: homeClub || { id: '', name: 'TBD', logo: null },
            competition: competitionName,
            matchdayOrder: match.matchdayOrder,
            isHome: false,
          })
        }
      }
    }

    const clubs = Array.from(clubMap.values()).sort((a, b) => b.totalOverdue - a.totalOverdue)
    const totalOverdueMatches = plazos.reduce((sum, p) => sum + (p.matches as any[]).length, 0)

    return {
      summary: { totalOverdueMatches, affectedClubs: clubs.length },
      clubs,
    }
  }

  private validateScopes(scopes: PlazoScopeInput[]) {
    for (const scope of scopes) {
      const hasMatchday = scope.matchdayFrom != null || scope.matchdayTo != null
      const hasKnockout = scope.knockoutRounds && scope.knockoutRounds.length > 0

      if (hasMatchday && hasKnockout) {
        throw new InvalidPlazoScopeError(
          'A scope cannot have both matchday range and knockout rounds'
        )
      }

      if (hasMatchday) {
        if (scope.matchdayFrom == null || scope.matchdayTo == null) {
          throw new InvalidPlazoScopeError('Both matchdayFrom and matchdayTo must be specified')
        }
        if (scope.matchdayFrom > scope.matchdayTo) {
          throw new InvalidPlazoScopeError('matchdayFrom must be less than or equal to matchdayTo')
        }
      }
    }
  }

  private enrichPlazoStats(plazo: any) {
    const matches = plazo.matches || []
    const total = matches.length
    const pending = matches.filter((m: any) => m.status === 'PENDIENTE').length
    const finalized = matches.filter((m: any) => m.status === 'FINALIZADO').length
    const cancelled = matches.filter((m: any) => m.status === 'CANCELADO').length
    const isOverdue = new Date(plazo.deadline) < new Date() && pending > 0

    return {
      ...plazo,
      stats: { total, pending, finalized, cancelled },
      isOverdue,
    }
  }
}
