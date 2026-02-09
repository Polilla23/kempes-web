import api from './api'

export interface CommentAuthor {
  id: string
  email: string
  role: string
  username?: string
  avatar?: string
}

export interface CommentData {
  id: string
  content: string
  author: CommentAuthor
  authorId: string
  newsId: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedComments {
  data: CommentData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ApiDataResponse<T> {
  data: T
  message?: string
}

class CommentService {
  static async getByNewsId(newsId: string, page = 1, limit = 20): Promise<PaginatedComments> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('limit', String(limit))

    const response = await api.get<ApiDataResponse<PaginatedComments>>(
      `/api/v1/news/${newsId}/comments?${params.toString()}`,
    )
    return response.data?.data || { data: [], total: 0, page: 1, limit: 20, totalPages: 0 }
  }

  static async create(newsId: string, content: string): Promise<CommentData> {
    const response = await api.post<ApiDataResponse<CommentData>>(
      `/api/v1/news/${newsId}/comments`,
      { content },
    )
    return response.data!.data
  }

  static async delete(newsId: string, commentId: string): Promise<void> {
    await api.delete(`/api/v1/news/${newsId}/comments/${commentId}`)
  }
}

export default CommentService
