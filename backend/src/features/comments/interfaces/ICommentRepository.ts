import { Comment, Prisma } from '@prisma/client'

export interface ICommentRepository {
  create(data: Prisma.CommentCreateInput): Promise<Comment>
  findById(id: string): Promise<Comment | null>
  findByNewsId(
    newsId: string,
    params?: {
      skip?: number
      take?: number
      orderBy?: Prisma.CommentOrderByWithRelationInput
    },
  ): Promise<Comment[]>
  countByNewsId(newsId: string): Promise<number>
  deleteOneById(id: string): Promise<void>
}
