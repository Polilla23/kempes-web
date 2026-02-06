import { ClubService } from '../clubs.service'
import { IClubRepository } from '../interfaces/IClubRepository'
import { ClubAlreadyExistsError, ClubNotFoundError } from '../clubs.errors'
import { Club } from '@prisma/client'
import { CreateClubInput } from '@/types'
import { StorageService } from '@/features/storage/storage.service'

const mockClubRepository: jest.Mocked<IClubRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByName: jest.fn(),
  findOneByUserId: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
  getActivePlayers: jest.fn(),
}

const mockStorageService: jest.Mocked<StorageService> = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  getFileMetadata: jest.fn(),
  replaceImage: jest.fn(),
} as any

describe('ClubService', () => {
  let clubService: ClubService

  beforeEach(() => {
    jest.clearAllMocks()
    clubService = new ClubService({
      clubRepository: mockClubRepository,
      storageService: mockStorageService,
    })
  })

  describe('createClub', () => {
    it('debería crear un club con valores por defecto', async () => {
      const input: CreateClubInput = {
        name: 'FC Barcelona',
      }

      const expectedClub: Club = {
        id: '123',
        name: 'FC Barcelona',
        logo: null,
        userId: null,
        isActive: true,
      }

      mockClubRepository.findOneByName.mockResolvedValue(null)
      mockClubRepository.save.mockResolvedValue(expectedClub)

      const result = await clubService.createClub(input)

      expect(result).toEqual(expectedClub)
      expect(mockClubRepository.findOneByName).toHaveBeenCalledWith('FC Barcelona')
      expect(mockClubRepository.save).toHaveBeenCalledTimes(1)
    })

    it('debería lanzar error si el club ya existe', async () => {
      const input: CreateClubInput = {
        name: 'FC Barcelona',
      }

      const existingClub: Club = {
        id: '123',
        name: 'FC Barcelona',
        logo: null,
        userId: null,
        isActive: true,
      }

      mockClubRepository.findOneByName.mockResolvedValue(existingClub)

      await expect(clubService.createClub(input)).rejects.toThrow(ClubAlreadyExistsError)
      expect(mockClubRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('findAllClubs', () => {
    it('debería retornar todos los clubes', async () => {
      const mockClubs: Club[] = [
        {
          id: '1',
          name: 'FC Barcelona',
          logo: null,
          userId: null,
          isActive: true,
        },
        {
          id: '2',
          name: 'Real Madrid',
          logo: null,
          userId: null,
          isActive: true,
        },
      ]

      mockClubRepository.findAll.mockResolvedValue(mockClubs)

      const result = await clubService.findAllClubs()

      expect(result).toEqual(mockClubs)
      expect(mockClubRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('findClubById', () => {
    it('debería retornar un club por ID', async () => {
      const clubId = '123'
      const mockClub: Club = {
        id: clubId,
        name: 'FC Barcelona',
        logo: null,
        userId: null,
        isActive: true,
      }

      mockClubRepository.findOneById.mockResolvedValue(mockClub)

      const result = await clubService.findClub(clubId)

      expect(result).toEqual(mockClub)
      expect(mockClubRepository.findOneById).toHaveBeenCalledWith(clubId)
    })

    it('debería lanzar ClubNotFoundError si no existe', async () => {
      const clubId = 'non-existent'
      mockClubRepository.findOneById.mockResolvedValue(null)

      await expect(clubService.findClub(clubId)).rejects.toThrow(ClubNotFoundError)
    })
  })

  describe('updateClub', () => {
    it('debería actualizar un club existente', async () => {
      const clubId = '123'
      const updateData = { name: 'New Name' }

      const existingClub: Club = {
        id: clubId,
        name: 'Old Name',
        logo: null,
        userId: null,
        isActive: true,
      }

      const updatedClub = { ...existingClub, name: 'New Name' }

      mockClubRepository.findOneById.mockResolvedValue(existingClub)
      mockClubRepository.updateOneById.mockResolvedValue(updatedClub)

      const result = await clubService.updateClub(clubId, updateData)

      expect(result).toEqual(updatedClub)
      expect(mockClubRepository.updateOneById).toHaveBeenCalledWith(clubId, updateData)
    })

    it('debería lanzar error si el club no existe', async () => {
      const clubId = 'non-existent'
      mockClubRepository.findOneById.mockResolvedValue(null)

      await expect(clubService.updateClub(clubId, {})).rejects.toThrow(ClubNotFoundError)
    })
  })

  describe('deleteClub', () => {
    it('debería eliminar un club por ID', async () => {
      const clubId = '123'
      const mockClub: Club = {
        id: clubId,
        name: 'FC Barcelona',
        logo: null,
        userId: null,
        isActive: true,
      }

      const deletedClub: Club = {
        ...mockClub,
        isActive: false,
      }

      mockClubRepository.findOneById.mockResolvedValue(mockClub)
      mockClubRepository.updateOneById.mockResolvedValue(deletedClub)

      const result = await clubService.deleteClub(clubId)

      expect(result).toEqual(deletedClub)
      expect(mockClubRepository.updateOneById).toHaveBeenCalledWith(clubId, { isActive: false })
    })
  })

  describe('createClub con logo file', () => {
    it('debería subir logo y crear club con la URL', async () => {
      const input: CreateClubInput & { logoFile?: any } = {
        name: 'FC Barcelona',
        logoFile: {
          buffer: Buffer.from('fake-image'),
          filename: 'logo.png',
          mimetype: 'image/png',
        },
      }

      const uploadedFile = {
        id: 'file-123',
        publicUrl: 'https://storage.supabase.co/club-logos/logo.png',
        fileName: 'logo.png',
        originalName: 'logo.png',
        fileSize: 1024,
        mimeType: 'image/png',
        bucket: 'club-logos',
        path: 'logo.png',
        entityType: 'CLUB' as any,
        entityId: undefined,
      }

      const expectedClub: Club = {
        id: '123',
        name: 'FC Barcelona',
        logo: uploadedFile.publicUrl,
        userId: null,
        isActive: true,
      }

      mockClubRepository.findOneByName.mockResolvedValue(null)
      mockStorageService.uploadImage.mockResolvedValue(uploadedFile)
      mockClubRepository.save.mockResolvedValue(expectedClub)

      // Simulate logoFile being passed
      ;(clubService as any).logoFile = input.logoFile
      const result = await clubService.createClub(input)
      ;(clubService as any).logoFile = undefined

      expect(mockStorageService.uploadImage).toHaveBeenCalledWith({
        file: input.logoFile.buffer,
        fileName: input.logoFile.filename,
        mimeType: input.logoFile.mimetype,
        entityType: 'CLUB',
      })
      expect(result.logo).toBe(uploadedFile.publicUrl)
    })
  })

  describe('updateClub con logo file', () => {
    it('debería subir nuevo logo y actualizar club', async () => {
      const clubId = '123'
      const existingClub: Club = {
        id: clubId,
        name: 'FC Barcelona',
        logo: 'old-logo.png',
        userId: null,
        isActive: true,
      }

      const logoFile = {
        buffer: Buffer.from('new-image'),
        filename: 'new-logo.png',
        mimetype: 'image/png',
      }

      const uploadedFile = {
        id: 'file-456',
        publicUrl: 'https://storage.supabase.co/club-logos/new-logo.png',
        fileName: 'new-logo.png',
        originalName: 'new-logo.png',
        fileSize: 2048,
        mimeType: 'image/png',
        bucket: 'club-logos',
        path: 'new-logo.png',
        entityType: 'CLUB' as any,
        entityId: clubId,
      }

      const updatedClub: Club = {
        ...existingClub,
        logo: uploadedFile.publicUrl,
      }

      mockClubRepository.findOneById.mockResolvedValue(existingClub)
      mockStorageService.uploadImage.mockResolvedValue(uploadedFile)
      mockClubRepository.updateOneById.mockResolvedValue(updatedClub)

      const result = await clubService.updateClub(clubId, { logoFile } as any)

      expect(mockStorageService.uploadImage).toHaveBeenCalledWith({
        file: logoFile.buffer,
        fileName: logoFile.filename,
        mimeType: logoFile.mimetype,
        entityType: 'CLUB',
        entityId: clubId,
      })
      expect(result.logo).toBe(uploadedFile.publicUrl)
    })
  })
})
