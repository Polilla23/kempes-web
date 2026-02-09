import { NewsService } from '../news.service'
import { INewsRepository } from '../interfaces/INewsRepository'
import { News } from '@prisma/client'
import { CreateNewsInput, UpdateNewsInput } from '@/types'
import { NewsNotFoundError, UnauthorizedNewsAccessError } from '../news.errors'

const mockNewsRepository: jest.Mocked<INewsRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
}

describe('NewsService', () => {
  let newsService: NewsService

  beforeEach(() => {
    jest.clearAllMocks()
    newsService = new NewsService({
      newsRepository: mockNewsRepository,
    })
  })

  describe('createNews', () => {
    it('debería crear una noticia', async () => {
      const input: CreateNewsInput = {
        title: 'Nueva noticia',
        content: 'Contenido de la noticia',
        authorId: 'author-1',
        images: ['image1.jpg'],
        tags: ['deportes'],
        isPublished: true,
      }

      const expectedNews: News = {
        id: '1',
        title: 'Nueva noticia',
        content: 'Contenido de la noticia',
        authorId: 'author-1',
        images: ['image1.jpg'],
        tags: ['deportes'],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNewsRepository.create.mockResolvedValue(expectedNews)

      const result = await newsService.createNews(input)

      expect(result).toEqual(expectedNews)
      expect(mockNewsRepository.create).toHaveBeenCalledTimes(1)
    })

    it('debería usar valores por defecto si no se proporcionan', async () => {
      const input: CreateNewsInput = {
        title: 'Nueva noticia',
        content: 'Contenido',
        authorId: 'author-1',
      }

      const expectedNews: News = {
        id: '1',
        title: 'Nueva noticia',
        content: 'Contenido',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNewsRepository.create.mockResolvedValue(expectedNews)

      const result = await newsService.createNews(input)

      expect(result).toEqual(expectedNews)
      expect(mockNewsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: input.title,
          content: input.content,
          images: [],
          tags: [],
          isPublished: true,
        }),
      )
    })
  })

  describe('getNewsById', () => {
    it('debería retornar una noticia por id', async () => {
      const mockNews: News = {
        id: '1',
        title: 'Noticia test',
        content: 'Contenido test',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNewsRepository.findById.mockResolvedValue(mockNews)

      const result = await newsService.getNewsById('1')

      expect(result).toEqual(mockNews)
      expect(mockNewsRepository.findById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar NewsNotFoundError si no existe', async () => {
      mockNewsRepository.findById.mockResolvedValue(null)

      await expect(newsService.getNewsById('999')).rejects.toThrow(NewsNotFoundError)
    })
  })

  describe('getAllNews', () => {
    it('debería retornar todas las noticias con paginación', async () => {
      const mockNewsList: News[] = [
        {
          id: '1',
          title: 'Noticia 1',
          content: 'Contenido 1',
          authorId: 'author-1',
          images: [],
          tags: [],
          isPublished: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Noticia 2',
          content: 'Contenido 2',
          authorId: 'author-1',
          images: [],
          tags: [],
          isPublished: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockNewsRepository.findAll.mockResolvedValue(mockNewsList)
      mockNewsRepository.count.mockResolvedValue(2)

      const result = await newsService.getAllNews(undefined, { page: 1, limit: 10 })

      expect(result.data).toEqual(mockNewsList)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.totalPages).toBe(1)
    })

    it('debería aplicar filtros de búsqueda', async () => {
      const mockNewsList: News[] = [
        {
          id: '1',
          title: 'Partido importante',
          content: 'Contenido',
          authorId: 'author-1',
          images: [],
          tags: [],
          isPublished: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockNewsRepository.findAll.mockResolvedValue(mockNewsList)
      mockNewsRepository.count.mockResolvedValue(1)

      const result = await newsService.getAllNews({ search: 'Partido' }, { page: 1, limit: 10 })

      expect(result.data).toEqual(mockNewsList)
      expect(mockNewsRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      )
    })
  })

  describe('updateNews', () => {
    it('debería actualizar una noticia si el usuario es el autor', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia original',
        content: 'Contenido original',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updateData: UpdateNewsInput = {
        title: 'Noticia actualizada',
        content: 'Contenido actualizado',
      }

      const updatedNews: News = {
        ...existingNews,
        title: 'Noticia actualizada',
        content: 'Contenido actualizado',
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)
      mockNewsRepository.updateOneById.mockResolvedValue(updatedNews)

      const result = await newsService.updateNews('1', updateData, 'author-1', 'USER')

      expect(result).toEqual(updatedNews)
      expect(mockNewsRepository.updateOneById).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'Noticia actualizada',
          content: 'Contenido actualizado',
        }),
      )
    })

    it('debería permitir actualizar si el usuario es ADMIN', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia original',
        content: 'Contenido original',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updateData: UpdateNewsInput = {
        title: 'Noticia actualizada por admin',
      }

      const updatedNews: News = {
        ...existingNews,
        title: 'Noticia actualizada por admin',
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)
      mockNewsRepository.updateOneById.mockResolvedValue(updatedNews)

      const result = await newsService.updateNews('1', updateData, 'admin-user', 'ADMIN')

      expect(result).toEqual(updatedNews)
    })

    it('debería lanzar UnauthorizedNewsAccessError si el usuario no es el autor ni admin', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia original',
        content: 'Contenido original',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)

      await expect(newsService.updateNews('1', { title: 'Update' }, 'other-user', 'USER')).rejects.toThrow(
        UnauthorizedNewsAccessError,
      )
    })

    it('debería lanzar NewsNotFoundError si la noticia no existe', async () => {
      mockNewsRepository.findById.mockResolvedValue(null)

      await expect(newsService.updateNews('999', { title: 'Update' }, 'user-1', 'USER')).rejects.toThrow(
        NewsNotFoundError,
      )
    })
  })

  describe('deleteNews', () => {
    it('debería eliminar una noticia si el usuario es el autor', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia',
        content: 'Contenido',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)
      mockNewsRepository.deleteOneById.mockResolvedValue(undefined)

      await newsService.deleteNews('1', 'author-1', 'USER')

      expect(mockNewsRepository.deleteOneById).toHaveBeenCalledWith('1')
    })

    it('debería permitir eliminar si el usuario es ADMIN', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia',
        content: 'Contenido',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)
      mockNewsRepository.deleteOneById.mockResolvedValue(undefined)

      await newsService.deleteNews('1', 'admin-user', 'ADMIN')

      expect(mockNewsRepository.deleteOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar UnauthorizedNewsAccessError si el usuario no es el autor ni admin', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia',
        content: 'Contenido',
        authorId: 'author-1',
        images: [],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)

      await expect(newsService.deleteNews('1', 'other-user', 'USER')).rejects.toThrow(
        UnauthorizedNewsAccessError,
      )
    })
  })

  describe('addImageToNews', () => {
    it('debería agregar una imagen a la noticia', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia',
        content: 'Contenido',
        authorId: 'author-1',
        images: ['image1.jpg'],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedNews: News = {
        ...existingNews,
        images: ['image1.jpg', 'image2.jpg'],
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)
      mockNewsRepository.updateOneById.mockResolvedValue(updatedNews)

      const result = await newsService.addImageToNews('1', 'image2.jpg')

      expect(result.images).toContain('image2.jpg')
      expect(result.images).toHaveLength(2)
    })
  })

  describe('removeImageFromNews', () => {
    it('debería remover una imagen de la noticia', async () => {
      const existingNews: News = {
        id: '1',
        title: 'Noticia',
        content: 'Contenido',
        authorId: 'author-1',
        images: ['image1.jpg', 'image2.jpg'],
        tags: [],
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedNews: News = {
        ...existingNews,
        images: ['image1.jpg'],
      }

      mockNewsRepository.findById.mockResolvedValue(existingNews)
      mockNewsRepository.updateOneById.mockResolvedValue(updatedNews)

      const result = await newsService.removeImageFromNews('1', 'image2.jpg')

      expect(result.images).not.toContain('image2.jpg')
      expect(result.images).toHaveLength(1)
    })
  })
})
