import { Prisma } from '@prisma/client'

export interface IClubRepository {
  generateFixture(): Promise<[] | null> // TODO: Return type (Prisma Fixture Model or null)
  savePlayersByCsv(): Promise<void>
}
