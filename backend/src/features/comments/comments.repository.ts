import { PrismaClient, Comment, Prisma } from '@prisma/client'
import { ICommentRepository } from './interfaces/ICommentRepository'

const authorSelect = {
  select: { id: true, email: true, role: true },
}

export class CommentRepository implements ICommentRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return await this.prisma.comment.create({
      data,
      include: { author: authorSelect },
    })
  }

  async findById(id: string): Promise<Comment | null> {
    return await this.prisma.comment.findUnique({
      where: { id },
      include: { author: authorSelect },
    })
  }

  async findByNewsId(
    newsId: string,
    params?: {
      skip?: number
      take?: number
      orderBy?: Prisma.CommentOrderByWithRelationInput
    },
  ): Promise<Comment[]> {
    return await this.prisma.comment.findMany({
      where: { newsId },
      skip: params?.skip,
      take: params?.take,
      orderBy: params?.orderBy ?? { createdAt: 'desc' },
      include: { author: authorSelect },
    })
  }

  async countByNewsId(newsId: string): Promise<number> {
    return await this.prisma.comment.count({ where: { newsId } })
  }

  async deleteOneById(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } })
  }
}
