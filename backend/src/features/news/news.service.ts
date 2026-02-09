import { News } from '@prisma/client'
import { INewsRepository } from './interfaces/INewsRepository'
import { CreateNewsInput, UpdateNewsInput, NewsFilterInput, PaginationInput } from '@/types'
import { NewsNotFoundError, UnauthorizedNewsAccessError } from './news.errors'

export class NewsService {
  private newsRepository: INewsRepository

  constructor({ newsRepository }: { newsRepository: INewsRepository }) {
    this.newsRepository = newsRepository
  }

  async createNews(input: CreateNewsInput): Promise<News> {
    return await this.newsRepository.create({
      title: input.title,
      content: input.content,
      author: {
        connect: { id: input.authorId },
      },
      images: input.images ?? [],
      tags: input.tags ?? [],
      isPublished: input.isPublished ?? true,
    })
  }

  async getNewsById(id: string): Promise<News> {
    const news = await this.newsRepository.findById(id)

    if (!news) {
      throw new NewsNotFoundError()
    }

    return news
  }

  async getAllNews(
    filters?: NewsFilterInput,
    pagination?: PaginationInput,
  ): Promise<{ data: News[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 10
    const skip = (page - 1) * limit

    // Construir el where de Prisma basado en los filtros
    const where: any = {}

    if (filters?.authorId) {
      where.authorId = filters.authorId
    }

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      }
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [news, total] = await Promise.all([
      this.newsRepository.findAll({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.newsRepository.count(where),
    ])

    return {
      data: news,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async updateNews(id: string, input: UpdateNewsInput, userId: string, userRole: string): Promise<News> {
    const existingNews = await this.newsRepository.findById(id)

    if (!existingNews) {
      throw new NewsNotFoundError()
    }

    // Solo el autor o un admin pueden editar
    if (existingNews.authorId !== userId && userRole !== 'ADMIN') {
      throw new UnauthorizedNewsAccessError()
    }

    const updateData: any = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.content !== undefined) updateData.content = input.content
    if (input.images !== undefined) updateData.images = input.images
    if (input.tags !== undefined) updateData.tags = input.tags
    if (input.isPublished !== undefined) updateData.isPublished = input.isPublished

    return await this.newsRepository.updateOneById(id, updateData)
  }

  async deleteNews(id: string, userId: string, userRole: string): Promise<void> {
    const existingNews = await this.newsRepository.findById(id)

    if (!existingNews) {
      throw new NewsNotFoundError()
    }

    // Solo el autor o un admin pueden eliminar
    if (existingNews.authorId !== userId && userRole !== 'ADMIN') {
      throw new UnauthorizedNewsAccessError()
    }

    await this.newsRepository.deleteOneById(id)
  }

  async addImageToNews(newsId: string, imageUrl: string): Promise<News> {
    const news = await this.newsRepository.findById(newsId)

    if (!news) {
      throw new NewsNotFoundError()
    }

    const updatedImages = [...news.images, imageUrl]

    return await this.newsRepository.updateOneById(newsId, {
      images: updatedImages,
    })
  }

  async removeImageFromNews(newsId: string, imageUrl: string): Promise<News> {
    const news = await this.newsRepository.findById(newsId)

    if (!news) {
      throw new NewsNotFoundError()
    }

    const updatedImages = news.images.filter((img) => img !== imageUrl)

    return await this.newsRepository.updateOneById(newsId, {
      images: updatedImages,
    })
  }
}
