import { Comment } from '@prisma/client'
import { ICommentRepository } from './interfaces/ICommentRepository'
import { INewsRepository } from '@/features/news/interfaces/INewsRepository'
import { CreateCommentInput, PaginationInput } from '@/types'
import { CommentNotFoundError, UnauthorizedCommentAccessError } from './comments.errors'
import { NewsNotFoundError } from '@/features/news/news.errors'

export class CommentService {
  private commentRepository: ICommentRepository
  private newsRepository: INewsRepository

  constructor({
    commentRepository,
    newsRepository,
  }: {
    commentRepository: ICommentRepository
    newsRepository: INewsRepository
  }) {
    this.commentRepository = commentRepository
    this.newsRepository = newsRepository
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const news = await this.newsRepository.findById(input.newsId)
    if (!news) {
      throw new NewsNotFoundError()
    }

    return await this.commentRepository.create({
      content: input.content,
      author: { connect: { id: input.authorId } },
      news: { connect: { id: input.newsId } },
    })
  }

  async getCommentsByNewsId(
    newsId: string,
    pagination?: PaginationInput,
  ): Promise<{ data: Comment[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 20
    const skip = (page - 1) * limit

    const [comments, total] = await Promise.all([
      this.commentRepository.findByNewsId(newsId, {
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.commentRepository.countByNewsId(newsId),
    ])

    return {
      data: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async deleteComment(commentId: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId)

    if (!comment) {
      throw new CommentNotFoundError()
    }

    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      throw new UnauthorizedCommentAccessError()
    }

    await this.commentRepository.deleteOneById(commentId)
  }
}
