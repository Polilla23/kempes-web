import { LeaguesRules, KempesCupRules } from 'utils/types'

export interface IUtilityRepository {
  generateFixture(): Promise<[] | null> // TODO: Return type (Prisma Fixture Model or null)
  createCompetition(config: LeaguesRules | KempesCupRules): Promise<void>
}
