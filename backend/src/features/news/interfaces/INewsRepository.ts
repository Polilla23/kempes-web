import { News, Prisma } from '@prisma/client'

export interface INewsRepository {
  create(data: Prisma.NewsCreateInput): Promise<News>
  findById(id: string): Promise<News | null>
  findAll(params?: {
    where?: Prisma.NewsWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.NewsOrderByWithRelationInput
  }): Promise<News[]>
  count(where?: Prisma.NewsWhereInput): Promise<number>
  updateOneById(id: string, data: Prisma.NewsUpdateInput): Promise<News>
  deleteOneById(id: string): Promise<void>
}
