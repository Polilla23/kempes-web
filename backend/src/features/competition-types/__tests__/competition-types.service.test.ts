import { CompetitionTypeService } from '../competition-types.service'
import { ICompetitionTypeRepository } from '../interface/ICompetitionTypeRepository'
import { CompetitionType, Prisma } from '@prisma/client'
import { CreateCompetitionTypeInput } from '@/types'
import { CompetitionTypeAlreadyExistsError, CompetitionTypeNotFoundError } from '../competition-types.errors'
import { StorageService } from '@/features/storage/storage.service'

const mockCompetitionTypeRepository: jest.Mocked<ICompetitionTypeRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByName: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
}

const mockStorageService: jest.Mocked<StorageService> = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  getFileMetadata: jest.fn(),
  replaceImage: jest.fn(),
} as any

describe('CompetitionTypeService', () => {
  let competitionTypeService: CompetitionTypeService

  beforeEach(() => {
    jest.clearAllMocks()
    competitionTypeService = new CompetitionTypeService({
      competitionTypeRepository: mockCompetitionTypeRepository,
      storageService: mockStorageService,
    })
  })

  describe('findAllCompetitionTypes', () => {
    it('debería retornar todos los tipos de competición', async () => {
      const mockCompetitionTypes: CompetitionType[] = [
        {
          id: '1',
          hierarchy: 1,
          name: 'FIRST_DIVISION' as any,
          format: 'LEAGUE' as any,
          category: 'SENIOR' as any,
          trophyImage: 'trophy1.png',
        },
        {
          id: '2',
          hierarchy: 2,
          name: 'CUP' as any,
          format: 'CUP' as any,
          category: 'SENIOR' as any,
          trophyImage: 'trophy2.png',
        },
      ]

      mockCompetitionTypeRepository.findAll.mockResolvedValue(mockCompetitionTypes)

      const result = await competitionTypeService.findAllCompetitionTypes()

      expect(result).toEqual(mockCompetitionTypes)
      expect(mockCompetitionTypeRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('findCompetitionType', () => {
    it('debería retornar un tipo de competición por id', async () => {
      const mockCompetitionType: CompetitionType = {
        id: '1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      mockCompetitionTypeRepository.findOneById.mockResolvedValue(mockCompetitionType)

      const result = await competitionTypeService.findCompetitionType('1')

      expect(result).toEqual(mockCompetitionType)
      expect(mockCompetitionTypeRepository.findOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar CompetitionTypeNotFoundError si no existe', async () => {
      mockCompetitionTypeRepository.findOneById.mockResolvedValue(null)

      await expect(competitionTypeService.findCompetitionType('999')).rejects.toThrow(
        CompetitionTypeNotFoundError,
      )
    })
  })

  describe('createCompetitionType', () => {
    it('debería crear un tipo de competición', async () => {
      const input: CreateCompetitionTypeInput = {
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      const expectedCompetitionType: CompetitionType = {
        id: '1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      mockCompetitionTypeRepository.findOneByName.mockResolvedValue(null)
      mockCompetitionTypeRepository.save.mockResolvedValue(expectedCompetitionType)

      const result = await competitionTypeService.createCompetitionType(input)

      expect(result).toEqual(expectedCompetitionType)
      expect(mockCompetitionTypeRepository.findOneByName).toHaveBeenCalledWith(input.name)
      expect(mockCompetitionTypeRepository.save).toHaveBeenCalledWith(input)
    })

    it('debería lanzar CompetitionTypeAlreadyExistsError si el nombre ya existe', async () => {
      const input: CreateCompetitionTypeInput = {
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      const existingCompetitionType: CompetitionType = {
        id: '1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      mockCompetitionTypeRepository.findOneByName.mockResolvedValue(existingCompetitionType)

      await expect(competitionTypeService.createCompetitionType(input)).rejects.toThrow(
        CompetitionTypeAlreadyExistsError,
      )
      expect(mockCompetitionTypeRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('updateCompetitionType', () => {
    it('debería actualizar un tipo de competición', async () => {
      const existingCompetitionType: CompetitionType = {
        id: '1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      const updateData: Prisma.CompetitionTypeUpdateInput = {
        hierarchy: 0,
      }

      const updatedCompetitionType: CompetitionType = {
        ...existingCompetitionType,
        hierarchy: 0,
      }

      mockCompetitionTypeRepository.findOneById.mockResolvedValue(existingCompetitionType)
      mockCompetitionTypeRepository.updateOneById.mockResolvedValue(updatedCompetitionType)

      const result = await competitionTypeService.updateCompetitionType('1', updateData)

      expect(result).toEqual(updatedCompetitionType)
      expect(mockCompetitionTypeRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockCompetitionTypeRepository.updateOneById).toHaveBeenCalledWith('1', updateData)
    })

    it('debería lanzar CompetitionTypeNotFoundError si no existe', async () => {
      const updateData: Prisma.CompetitionTypeUpdateInput = {
        hierarchy: 0,
      }

      mockCompetitionTypeRepository.findOneById.mockResolvedValue(null)

      await expect(competitionTypeService.updateCompetitionType('999', updateData)).rejects.toThrow(
        CompetitionTypeNotFoundError,
      )
      expect(mockCompetitionTypeRepository.updateOneById).not.toHaveBeenCalled()
    })
  })

  describe('deleteCompetitionType', () => {
    it('debería eliminar un tipo de competición', async () => {
      const existingCompetitionType: CompetitionType = {
        id: '1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'trophy1.png',
      }

      mockCompetitionTypeRepository.findOneById.mockResolvedValue(existingCompetitionType)
      mockCompetitionTypeRepository.deleteOneById.mockResolvedValue(existingCompetitionType)

      const result = await competitionTypeService.deleteCompetitionType('1')

      expect(result).toEqual(existingCompetitionType)
      expect(mockCompetitionTypeRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockCompetitionTypeRepository.deleteOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar CompetitionTypeNotFoundError si no existe', async () => {
      mockCompetitionTypeRepository.findOneById.mockResolvedValue(null)

      await expect(competitionTypeService.deleteCompetitionType('999')).rejects.toThrow(
        CompetitionTypeNotFoundError,
      )
      expect(mockCompetitionTypeRepository.deleteOneById).not.toHaveBeenCalled()
    })
  })

  describe('createCompetitionType con trophy image file', () => {
    it('debería subir imagen de trofeo y crear competitionType con la URL', async () => {
      const input: CreateCompetitionTypeInput & { trophyImageFile?: any } = {
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImageFile: {
          buffer: Buffer.from('fake-image'),
          filename: 'trophy.png',
          mimetype: 'image/png',
        },
      }

      const uploadedFile = {
        id: 'file-123',
        publicUrl: 'https://storage.supabase.co/trophy-images/trophy.png',
        fileName: 'trophy.png',
        originalName: 'trophy.png',
        fileSize: 1024,
        mimeType: 'image/png',
        bucket: 'trophy-images',
        path: 'trophy.png',
        entityType: 'TROPHY' as any,
        entityId: undefined,
      }

      const expectedCompetitionType: CompetitionType = {
        id: '1',
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: uploadedFile.publicUrl,
      }

      mockCompetitionTypeRepository.findOneByName.mockResolvedValue(null)
      mockStorageService.uploadImage.mockResolvedValue(uploadedFile)
      mockCompetitionTypeRepository.save.mockResolvedValue(expectedCompetitionType)

      // Simulate trophyImageFile being passed
      ;(competitionTypeService as any).trophyImageFile = input.trophyImageFile
      const result = await competitionTypeService.createCompetitionType(input)
      ;(competitionTypeService as any).trophyImageFile = undefined

      expect(mockStorageService.uploadImage).toHaveBeenCalledWith({
        file: input.trophyImageFile.buffer,
        fileName: input.trophyImageFile.filename,
        mimeType: input.trophyImageFile.mimetype,
        entityType: 'TROPHY',
      })
      expect(result.trophyImage).toBe(uploadedFile.publicUrl)
    })
  })

  describe('updateCompetitionType con trophy image file', () => {
    it('debería subir nueva imagen de trofeo y actualizar competitionType', async () => {
      const competitionTypeId = '1'
      const existingCompetitionType: CompetitionType = {
        id: competitionTypeId,
        hierarchy: 1,
        name: 'FIRST_DIVISION' as any,
        format: 'LEAGUE' as any,
        category: 'SENIOR' as any,
        trophyImage: 'old-trophy.png',
      }

      const trophyImageFile = {
        buffer: Buffer.from('new-image'),
        filename: 'new-trophy.png',
        mimetype: 'image/png',
      }

      const uploadedFile = {
        id: 'file-456',
        publicUrl: 'https://storage.supabase.co/trophy-images/new-trophy.png',
        fileName: 'new-trophy.png',
        originalName: 'new-trophy.png',
        fileSize: 2048,
        mimeType: 'image/png',
        bucket: 'trophy-images',
        path: 'new-trophy.png',
        entityType: 'TROPHY' as any,
        entityId: competitionTypeId,
      }

      const updatedCompetitionType: CompetitionType = {
        ...existingCompetitionType,
        trophyImage: uploadedFile.publicUrl,
      }

      mockCompetitionTypeRepository.findOneById.mockResolvedValue(existingCompetitionType)
      mockStorageService.uploadImage.mockResolvedValue(uploadedFile)
      mockCompetitionTypeRepository.updateOneById.mockResolvedValue(updatedCompetitionType)

      const result = await competitionTypeService.updateCompetitionType(competitionTypeId, {
        trophyImageFile,
      } as any)

      expect(mockStorageService.uploadImage).toHaveBeenCalledWith({
        file: trophyImageFile.buffer,
        fileName: trophyImageFile.filename,
        mimeType: trophyImageFile.mimetype,
        entityType: 'TROPHY',
        entityId: competitionTypeId,
      })
      expect(result.trophyImage).toBe(uploadedFile.publicUrl)
    })
  })
})
