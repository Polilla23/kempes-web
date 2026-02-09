import { PrismaClient, News, Prisma } from '@prisma/client'
import { INewsRepository } from './interfaces/INewsRepository'

export class NewsRepository implements INewsRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async create(data: Prisma.NewsCreateInput): Promise<News> {
    return await this.prisma.news.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    })
  }

  async findById(id: string): Promise<News | null> {
    return await this.prisma.news.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    })
  }

  async findAll(params?: {
    where?: Prisma.NewsWhereInput
    skip?: number
    take?: number
    orderBy?: Prisma.NewsOrderByWithRelationInput
  }): Promise<News[]> {
    return await this.prisma.news.findMany({
      where: params?.where,
      skip: params?.skip,
      take: params?.take,
      orderBy: params?.orderBy ?? { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    })
  }

  async count(where?: Prisma.NewsWhereInput): Promise<number> {
    return await this.prisma.news.count({ where })
  }

  async updateOneById(id: string, data: Prisma.NewsUpdateInput): Promise<News> {
    return await this.prisma.news.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    })
  }

  async deleteOneById(id: string): Promise<void> {
    await this.prisma.news.delete({ where: { id } })
  }
}
