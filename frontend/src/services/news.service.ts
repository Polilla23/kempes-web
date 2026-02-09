import api from './api'

// Types for news
export interface NewsAuthor {
  id: string
  email: string
  role: string
}

export interface News {
  id: string
  title: string
  content: string
  author: NewsAuthor
  images: string[]
  tags: string[]
  isPublished: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  _count?: {
    comments: number
  }
}

export interface CreateNewsInput {
  title: string
  content: string
  images?: string[]
  tags?: string[]
  isPublished?: boolean
}

export interface UpdateNewsInput {
  title?: string
  content?: string
  images?: string[]
  tags?: string[]
  isPublished?: boolean
}

export interface NewsFilterInput {
  authorId?: string
  tags?: string[]
  isPublished?: boolean
  search?: string
}

export interface PaginationInput {
  page?: number
  limit?: number
}

export interface PaginatedNews {
  data: News[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UploadedFile {
  id: string
  publicUrl: string
  fileName?: string
  mimeType?: string
  size?: number
}

// API Response wrappers
interface ApiDataResponse<T> {
  data: T
  message?: string
}

class NewsService {
  /**
   * Get all news with optional filters and pagination
   */
  static async getAll(filters?: NewsFilterInput, pagination?: PaginationInput): Promise<PaginatedNews> {
    const params = new URLSearchParams()

    if (filters?.authorId) params.append('authorId', filters.authorId)
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','))
    if (filters?.isPublished !== undefined) params.append('isPublished', String(filters.isPublished))
    if (filters?.search) params.append('search', filters.search)
    if (pagination?.page) params.append('page', String(pagination.page))
    if (pagination?.limit) params.append('limit', String(pagination.limit))

    const queryString = params.toString()
    const url = `/api/v1/news${queryString ? `?${queryString}` : ''}`

    const response = await api.get<ApiDataResponse<PaginatedNews>>(url)
    return (
      response.data?.data || {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
    )
  }

  /**
   * Get a single news by ID
   */
  static async getById(id: string): Promise<News> {
    const response = await api.get<ApiDataResponse<News>>(`/api/v1/news/${id}`)
    return response.data!.data
  }

  /**
   * Create a new news post
   */
  static async create(input: CreateNewsInput): Promise<News> {
    const response = await api.post<ApiDataResponse<News>>('/api/v1/news', input)
    return response.data!.data
  }

  /**
   * Update an existing news post
   */
  static async update(id: string, input: UpdateNewsInput): Promise<News> {
    const response = await api.patch<ApiDataResponse<News>>(`/api/v1/news/${id}`, input)
    return response.data!.data
  }

  /**
   * Delete a news post
   */
  static async delete(id: string): Promise<void> {
    await api.delete(`/api/v1/news/${id}`)
  }

  /**
   * Add an image to a news post
   */
  static async addImage(newsId: string, imageUrl: string): Promise<News> {
    const response = await api.post<ApiDataResponse<News>>(`/api/v1/news/${newsId}/images`, { imageUrl })
    return response.data!.data
  }

  /**
   * Remove an image from a news post
   */
  static async removeImage(newsId: string, imageUrl: string): Promise<News> {
    const response = await api.delete<ApiDataResponse<News>>(`/api/v1/news/${newsId}/images`, { imageUrl })
    return response.data!.data
  }

  /**
   * Upload an image file for news
   */
  static async uploadImage(file: File): Promise<UploadedFile> {
    const formData = new FormData()
    // IMPORTANT: Text fields must come BEFORE the file for @fastify/multipart
    formData.append('entityType', 'NEWS')
    formData.append('file', file)

    const response = await api.post<ApiDataResponse<UploadedFile>>('/api/v1/storage/upload', formData)
    return response.data!.data
  }
}

export default NewsService
