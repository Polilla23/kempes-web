import { News, Prisma } from '@prisma/client'

export interface INewsRepository {
  create(data: Prisma.NewsCreateInput): Promise<News>
  findById(id: string, userId?: string): Promise<News | null>
  findAll(params?: {
    where?: Prisma.NewsWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.NewsOrderByWithRelationInput
    userId?: string
  }): Promise<News[]>
  count(where?: Prisma.NewsWhereInput): Promise<number>
  updateOneById(id: string, data: Prisma.NewsUpdateInput): Promise<News>
  deleteOneById(id: string): Promise<void>
  findLike(userId: string, newsId: string): Promise<{ id: string } | null>
  createLike(userId: string, newsId: string): Promise<void>
  deleteLike(userId: string, newsId: string): Promise<void>
  countLikes(newsId: string): Promise<number>
}
