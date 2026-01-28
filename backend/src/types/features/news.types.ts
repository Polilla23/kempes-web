export type CreateNewsInput = {
  title: string
  content: string
  authorId: string
  images?: string[]
  tags?: string[]
  isPublished?: boolean
}

export type UpdateNewsInput = {
  title?: string
  content?: string
  images?: string[]
  tags?: string[]
  isPublished?: boolean
}

export type NewsFilterInput = {
  authorId?: string
  tags?: string[]
  isPublished?: boolean
  search?: string
}

export type PaginationInput = {
  page?: number
  limit?: number
}
