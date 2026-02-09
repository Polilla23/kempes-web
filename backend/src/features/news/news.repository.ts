import { PrismaClient, News, Prisma } from '@prisma/client'
import { INewsRepository } from './interfaces/INewsRepository'

export class NewsRepository implements INewsRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  private getInclude(userId?: string) {
    return {
      author: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: { comments: true, likes: true },
      },
      ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
    }
  }

  async create(data: Prisma.NewsCreateInput): Promise<News> {
    return await this.prisma.news.create({
      data,
      include: this.getInclude(),
    })
  }

  async findById(id: string, userId?: string): Promise<News | null> {
    return await this.prisma.news.findUnique({
      where: { id },
      include: this.getInclude(userId),
    })
  }

  async findAll(params?: {
    where?: Prisma.NewsWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.NewsOrderByWithRelationInput
    userId?: string
  }): Promise<News[]> {
    return await this.prisma.news.findMany({
      where: params?.where,
      skip: params?.skip,
      take: params?.take,
      orderBy: params?.orderBy ?? { publishedAt: 'desc' },
      include: this.getInclude(params?.userId),
    })
  }

  async count(where?: Prisma.NewsWhereInput): Promise<number> {
    return await this.prisma.news.count({ where })
  }

  async updateOneById(id: string, data: Prisma.NewsUpdateInput): Promise<News> {
    return await this.prisma.news.update({
      where: { id },
      data,
      include: this.getInclude(),
    })
  }

  async deleteOneById(id: string): Promise<void> {
    await this.prisma.news.delete({ where: { id } })
  }

  async findLike(userId: string, newsId: string): Promise<{ id: string } | null> {
    return await this.prisma.newsLike.findUnique({
      where: { userId_newsId: { userId, newsId } },
      select: { id: true },
    })
  }

  async createLike(userId: string, newsId: string): Promise<void> {
    await this.prisma.newsLike.create({
      data: { userId, newsId },
    })
  }

  async deleteLike(userId: string, newsId: string): Promise<void> {
    await this.prisma.newsLike.delete({
      where: { userId_newsId: { userId, newsId } },
    })
  }

  async countLikes(newsId: string): Promise<number> {
    return await this.prisma.newsLike.count({
      where: { newsId },
    })
  }
}
