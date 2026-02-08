import { KempesitaConfig, Prisma } from '@prisma/client'

export interface IKempesitaConfigRepository {
  findActive(): Promise<KempesitaConfig | null>
  save(data: Prisma.KempesitaConfigCreateInput): Promise<KempesitaConfig>
  updateOneById(id: string, data: Prisma.KempesitaConfigUpdateInput): Promise<KempesitaConfig>
}
