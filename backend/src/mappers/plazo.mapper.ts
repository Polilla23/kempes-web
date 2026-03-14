export class PlazoMapper {
  static toDTO(plazo: any) {
    return {
      id: plazo.id,
      seasonHalfId: plazo.seasonHalfId,
      title: plazo.title,
      deadline: plazo.deadline,
      order: plazo.order,
      isOpen: plazo.isOpen ?? false,
      createdAt: plazo.createdAt,
      updatedAt: plazo.updatedAt,
      seasonHalf: plazo.seasonHalf || undefined,
      scopes: (plazo.scopes || []).map((s: any) => ({
        id: s.id,
        competitionId: s.competitionId,
        matchdayFrom: s.matchdayFrom,
        matchdayTo: s.matchdayTo,
        knockoutRounds: s.knockoutRounds,
        competition: s.competition
          ? {
              id: s.competition.id,
              name: s.competition.name,
              system: s.competition.system,
            }
          : undefined,
      })),
      stats: plazo.stats || undefined,
      isOverdue: plazo.isOverdue ?? false,
    }
  }

  static toDTOArray(plazos: any[]) {
    return plazos.map((p) => PlazoMapper.toDTO(p))
  }
}
