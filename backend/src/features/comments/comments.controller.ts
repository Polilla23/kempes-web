import { FastifyRequest, FastifyReply } from 'fastify'
import { CommentService } from './comments.service'
import { Response } from '@/features/core'
import { CreateCommentInput, PaginationInput } from '@/types'

export class CommentController {
  private commentService: CommentService

  constructor({ commentService }: { commentService: CommentService }) {
    this.commentService = commentService
  }

  async getByNewsId(
    req: FastifyRequest<{ Params: { id: string }; Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id: newsId } = req.params
      const query = req.query as any

      const pagination: PaginationInput = {
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
      }

      const result = await this.commentService.getCommentsByNewsId(newsId, pagination)
      return Response.success(reply, result)
    } catch (error: any) {
      return Response.internal(reply, error.message)
    }
  }

  async create(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id: newsId } = req.params
      const { content } = req.body as { content: string }
      const userId = (req.user as any)?.id

      if (!userId) {
        return Response.unauthorized(reply, 'User not authenticated')
      }

      const input: CreateCommentInput = {
        content,
        authorId: userId,
        newsId,
      }

      const comment = await this.commentService.createComment(input)
      return Response.created(reply, comment, 'Comment created successfully')
    } catch (error: any) {
      if (error.name === 'NewsNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }

  async delete(
    req: FastifyRequest<{ Params: { id: string; commentId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { commentId } = req.params
      const userId = (req.user as any)?.id
      const userRole = (req.user as any)?.role

      if (!userId) {
        return Response.unauthorized(reply, 'User not authenticated')
      }

      await this.commentService.deleteComment(commentId, userId, userRole)
      return Response.success(reply, null, 'Comment deleted successfully')
    } catch (error: any) {
      if (error.name === 'CommentNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      if (error.name === 'UnauthorizedCommentAccessError') {
        return Response.forbidden(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }
}
