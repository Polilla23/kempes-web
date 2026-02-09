import { FastifyRequest, FastifyReply } from 'fastify'
import { NewsService } from './news.service'
import { Response } from '@/features/core'
import { CreateNewsInput, UpdateNewsInput, NewsFilterInput, PaginationInput } from '@/types'

export class NewsController {
  private newsService: NewsService

  constructor({ newsService }: { newsService: NewsService }) {
    this.newsService = newsService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      const body = req.body as CreateNewsInput
      const userId = (req.user as any)?.id

      if (!userId) {
        return Response.unauthorized(reply, 'User not authenticated')
      }

      const input: CreateNewsInput = {
        ...body,
        authorId: userId,
      }

      const news = await this.newsService.createNews(input)

      return Response.created(reply, news, 'News created successfully')
    } catch (error: any) {
      return Response.internal(reply, error.message)
    }
  }

  async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = req.params

      // Soft-auth: try to extract userId from JWT if present
      let userId: string | undefined
      try {
        await req.jwtVerify()
        userId = (req.user as any)?.id
      } catch {}

      const news = await this.newsService.getNewsById(id, userId)

      return Response.success(reply, news)
    } catch (error: any) {
      if (error.name === 'NewsNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }

  async getAll(req: FastifyRequest, reply: FastifyReply) {
    try {
      const query = req.query as any

      const filters: NewsFilterInput = {
        authorId: query.authorId,
        tags: query.tags ? query.tags.split(',') : undefined,
        isPublished: query.isPublished === 'true' ? true : query.isPublished === 'false' ? false : undefined,
        search: query.search,
      }

      const pagination: PaginationInput = {
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 10,
      }

      // Soft-auth: try to extract userId from JWT if present
      let userId: string | undefined
      try {
        await req.jwtVerify()
        userId = (req.user as any)?.id
      } catch {}

      const result = await this.newsService.getAllNews(filters, pagination, userId)

      return Response.success(reply, result)
    } catch (error: any) {
      return Response.internal(reply, error.message)
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = req.params
      const body = req.body as UpdateNewsInput
      const userId = (req.user as any)?.id
      const userRole = (req.user as any)?.role

      if (!userId) {
        return Response.unauthorized(reply, 'User not authenticated')
      }

      const news = await this.newsService.updateNews(id, body, userId, userRole)

      return Response.success(reply, news, 'News updated successfully')
    } catch (error: any) {
      if (error.name === 'NewsNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      if (error.name === 'UnauthorizedNewsAccessError') {
        return Response.forbidden(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = req.params
      const userId = (req.user as any)?.id
      const userRole = (req.user as any)?.role

      if (!userId) {
        return Response.unauthorized(reply, 'User not authenticated')
      }

      await this.newsService.deleteNews(id, userId, userRole)

      return Response.success(reply, null, 'News deleted successfully')
    } catch (error: any) {
      if (error.name === 'NewsNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      if (error.name === 'UnauthorizedNewsAccessError') {
        return Response.forbidden(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }

  async addImage(
    req: FastifyRequest<{ Params: { id: string }; Body: { imageUrl: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = req.params
      const { imageUrl } = req.body

      const news = await this.newsService.addImageToNews(id, imageUrl)

      return Response.success(reply, news, 'Image added successfully')
    } catch (error: any) {
      if (error.name === 'NewsNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }

  async removeImage(
    req: FastifyRequest<{ Params: { id: string }; Body: { imageUrl: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = req.params
      const { imageUrl } = req.body

      const news = await this.newsService.removeImageFromNews(id, imageUrl)

      return Response.success(reply, news, 'Image removed successfully')
    } catch (error: any) {
      if (error.name === 'NewsNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }

  async toggleLike(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = req.params
      const userId = (req.user as any)?.id

      if (!userId) {
        return Response.unauthorized(reply, 'User not authenticated')
      }

      const result = await this.newsService.toggleLike(id, userId)

      return Response.success(reply, result)
    } catch (error: any) {
      if (error.name === 'NewsNotFoundError') {
        return Response.notFound(reply, error.message)
      }
      return Response.internal(reply, error.message)
    }
  }
}
