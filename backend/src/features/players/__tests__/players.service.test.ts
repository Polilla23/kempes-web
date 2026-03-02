import { PlayerService } from '../players.service'
import { IPlayerRespository } from '../interface/IPlayerRepository'
import { PlayerErrors } from '../players.errors'
import { Player } from '@prisma/client'
import { CreateBasicPlayerInput } from '@/types'
import { StorageService } from '@/features/storage/storage.service'
import { SalaryRateService } from '@/features/salary-rates/salary-rates.service'
import { KempesitaConfigService } from '@/features/kempesita-config/kempesita-config.service'

// Mock del repositorio
const mockPlayerRepository: jest.Mocked<IPlayerRespository> = {
  save: jest.fn(),
  saveMany: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
}

const mockStorageService: jest.Mocked<StorageService> = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  getFileMetadata: jest.fn(),
  replaceImage: jest.fn(),
} as any

const mockSalaryRateService: jest.Mocked<SalaryRateService> = {
  findAllSalaryRates: jest.fn().mockResolvedValue([]),
} as any

const mockKempesitaConfigService: jest.Mocked<KempesitaConfigService> = {
  getActiveConfig: jest.fn().mockResolvedValue(null),
} as any

describe('PlayerService', () => {
  let playerService: PlayerService

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks()

    // Crear una nueva instancia del servicio con el mock
    playerService = new PlayerService({
      playerRepository: mockPlayerRepository,
      storageService: mockStorageService,
      salaryRateService: mockSalaryRateService,
      kempesitaConfigService: mockKempesitaConfigService,
    })
  })

  describe('createPlayer', () => {
    it('debería crear un jugador con valores por defecto cuando solo se envían campos básicos', async () => {
      // Arrange (preparar)
      const input: CreateBasicPlayerInput = {
        name: 'Lionel Messi',
        birthdate: new Date('1987-06-24'),
      }

      const expectedPlayer: Player = {
        id: '123',
        name: 'Lionel Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'null',
        ownerClubId: 'null',
        overall: 50,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true, position: null,
        avatar: null,
      }

      mockPlayerRepository.save.mockResolvedValue(expectedPlayer)

      // Act (ejecutar)
      const result = await playerService.createPlayer(input)

      // Assert (verificar)
      expect(result).toEqual(expectedPlayer)
      expect(mockPlayerRepository.save).toHaveBeenCalledTimes(1)
      expect(mockPlayerRepository.save).toHaveBeenCalledWith({
        name: 'Lionel Messi',
        birthdate: expect.any(Date),
        overall: 50,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true, position: null,
      })
    })

    it('debería usar los valores proporcionados en lugar de los defaults', async () => {
      // Arrange
      const input: CreateBasicPlayerInput = {
        name: 'Cristiano Ronaldo',
        birthdate: new Date('1985-02-05'),
        overall: 91,
        sofifaId: '20801',
        transfermarktId: '8198',
        actualClubId: 'club-123',
      }

      const expectedPlayer: Player = {
        id: '456',
        name: 'Cristiano Ronaldo',
        birthdate: new Date('1985-02-05'),
        actualClubId: 'club-123',
        ownerClubId: 'null',
        overall: 91,
        salary: 100000,
        sofifaId: '20801',
        transfermarktId: '8198',
        isKempesita: false,
        isActive: true, position: null,
        avatar: null,
      }

      mockPlayerRepository.save.mockResolvedValue(expectedPlayer)

      // Act
      const result = await playerService.createPlayer(input)

      // Assert
      expect(result).toEqual(expectedPlayer)
      expect(mockPlayerRepository.save).toHaveBeenCalledWith({
        name: 'Cristiano Ronaldo',
        birthdate: expect.any(Date),
        overall: 91,
        salary: 100000,
        sofifaId: '20801',
        transfermarktId: '8198',
        isKempesita: false,
        isActive: true, position: null,
        actualClub: { connect: { id: 'club-123' } },
      })
    })
  })

  describe('findAllPlayers', () => {
    it('debería retornar todos los jugadores', async () => {
      // Arrange
      const mockPlayers: Player[] = [
        {
          id: '1',
          name: 'Lionel Messi',
          birthdate: new Date('1987-06-24'),
          actualClubId: 'club-1',
          ownerClubId: 'null',
          overall: 93,
          salary: 100000,
          sofifaId: null,
          transfermarktId: null,
          isKempesita: false,
          isActive: true, position: null,
          avatar: null,
        },
      ]

      mockPlayerRepository.findAll.mockResolvedValue(mockPlayers)

      // Act
      const result = await playerService.findAllPlayers()

      // Assert
      expect(result).toEqual(mockPlayers)
      expect(mockPlayerRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('updatePlayer', () => {
    it('debería actualizar un jugador existente', async () => {
      // Arrange
      const playerId = '123'
      const updateData = { overall: 95 }

      const existingPlayer: Player = {
        id: playerId,
        name: 'Lionel Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'club-1',
        ownerClubId: 'null',
        overall: 93,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true, position: null,
        avatar: null,
      }

      const updatedPlayer = { ...existingPlayer, overall: 95 }

      mockPlayerRepository.findOneById.mockResolvedValue(existingPlayer)
      mockPlayerRepository.updateOneById.mockResolvedValue(updatedPlayer)

      // Act
      const result = await playerService.updatePlayer(playerId, updateData)

      // Assert
      expect(result).toEqual(updatedPlayer)
      expect(mockPlayerRepository.findOneById).toHaveBeenCalledWith(playerId)
      expect(mockPlayerRepository.updateOneById).toHaveBeenCalledWith(playerId, updateData)
    })

    it('debería lanzar PlayerNotFoundError si el jugador no existe', async () => {
      // Arrange
      const playerId = 'non-existent-id'
      const updateData = { overall: 95 }

      mockPlayerRepository.findOneById.mockResolvedValue(null)

      // Act & Assert
      await expect(playerService.updatePlayer(playerId, updateData)).rejects.toThrow(PlayerErrors.NotFound)
      expect(mockPlayerRepository.updateOneById).not.toHaveBeenCalled()
    })
  })

  describe('deletePlayer', () => {
    it('debería eliminar un jugador por ID', async () => {
      // Arrange
      const playerId = '123'
      const deletedPlayer: Player = {
        id: playerId,
        name: 'Lionel Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'club-1',
        ownerClubId: 'null',
        overall: 95,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true, position: null,
        avatar: null,
      }

      const deletedPlayerResult: Player = {
        ...deletedPlayer,
        isActive: false,
      }

      mockPlayerRepository.findOneById.mockResolvedValue(deletedPlayer)
      mockPlayerRepository.updateOneById.mockResolvedValue(deletedPlayerResult)

      // Act
      const result = await playerService.deletePlayer(playerId)

      // Assert
      expect(result).toEqual(deletedPlayerResult)
      expect(mockPlayerRepository.findOneById).toHaveBeenCalledWith(playerId)
      expect(mockPlayerRepository.updateOneById).toHaveBeenCalledWith(playerId, { isActive: false })
    })
  })

  describe('Error Handling', () => {
    it('debería lanzar ValidationError con birthdate inválida', async () => {
      // Arrange
      const input: CreateBasicPlayerInput = {
        name: 'Test Player',
        birthdate: new Date('invalid-date'),
      }

      // Act & Assert
      await expect(playerService.createPlayer(input)).rejects.toThrow(PlayerErrors.Validation)
    })

    it('debería lanzar NotFound al buscar jugador con ID inexistente', async () => {
      // Arrange
      const fakeId = 'non-existent-id'
      mockPlayerRepository.findOneById.mockResolvedValue(null)

      // Act & Assert
      await expect(playerService.findPlayerById(fakeId)).rejects.toThrow(PlayerErrors.NotFound)
      expect(mockPlayerRepository.findOneById).toHaveBeenCalledWith(fakeId)
    })

    it('debería lanzar NotFound al eliminar jugador con ID inexistente', async () => {
      // Arrange
      const fakeId = 'non-existent-id'
      mockPlayerRepository.findOneById.mockResolvedValue(null)

      // Act & Assert
      await expect(playerService.deletePlayer(fakeId)).rejects.toThrow(PlayerErrors.NotFound)
      expect(mockPlayerRepository.deleteOneById).not.toHaveBeenCalled()
    })

    it('debería lanzar CSV error cuando el archivo está vacío', async () => {
      // Arrange
      const emptyCSV = ''

      // Act & Assert
      await expect(playerService.processCSVFile(emptyCSV)).rejects.toThrow(PlayerErrors.CSV)
    })

    it('debería lanzar CSV error cuando faltan campos requeridos', async () => {
      // Arrange
      const invalidCSV = `name;birthdate
Lionel Messi;24/06/1987`

      // Act & Assert (falta actualClubId y overall)
      await expect(playerService.processCSVFile(invalidCSV)).rejects.toThrow(PlayerErrors.CSV)
    })

    it('debería lanzar CSV error con formato de fecha inválido', async () => {
      // Arrange
      const invalidCSV = `name;birthdate;actualClubId;overall
Lionel Messi;fecha-invalida;club-123;90`

      // Act & Assert
      await expect(playerService.processCSVFile(invalidCSV)).rejects.toThrow(PlayerErrors.CSV)
    })
  })

  describe('createPlayer con avatar file', () => {
    it('debería subir avatar y crear jugador con la URL', async () => {
      const input: CreateBasicPlayerInput & { avatarFile?: any } = {
        name: 'Lionel Messi',
        birthdate: new Date('1987-06-24'),
        avatarFile: {
          buffer: Buffer.from('fake-image'),
          filename: 'avatar.png',
          mimetype: 'image/png',
        },
      }

      const uploadedFile = {
        id: 'file-123',
        publicUrl: 'https://storage.supabase.co/player-avatars/avatar.png',
        fileName: 'avatar.png',
        originalName: 'avatar.png',
        fileSize: 1024,
        mimeType: 'image/png',
        bucket: 'player-avatars',
        path: 'avatar.png',
        entityType: 'PLAYER' as any,
        entityId: undefined,
      }

      const expectedPlayer: Player = {
        id: '123',
        name: 'Lionel Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'null',
        ownerClubId: 'null',
        overall: 50,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true, position: null,
        avatar: uploadedFile.publicUrl,
      }

      mockStorageService.uploadImage.mockResolvedValue(uploadedFile)
      mockPlayerRepository.save.mockResolvedValue(expectedPlayer)

      const result = await playerService.createPlayer(input)

      expect(mockStorageService.uploadImage).toHaveBeenCalledWith({
        file: input.avatarFile.buffer,
        fileName: input.avatarFile.filename,
        mimeType: input.avatarFile.mimetype,
        entityType: 'PLAYER',
      })
      expect(result.avatar).toBe(uploadedFile.publicUrl)
    })
  })

  describe('updatePlayer con avatar file', () => {
    it('debería subir nuevo avatar y actualizar jugador', async () => {
      const playerId = '123'
      const existingPlayer: Player = {
        id: playerId,
        name: 'Lionel Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'null',
        ownerClubId: 'null',
        overall: 95,
        salary: 1000000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true, position: null,
        avatar: 'old-avatar.png',
      }

      const avatarFile = {
        buffer: Buffer.from('new-image'),
        filename: 'new-avatar.png',
        mimetype: 'image/png',
      }

      const uploadedFile = {
        id: 'file-456',
        publicUrl: 'https://storage.supabase.co/player-avatars/new-avatar.png',
        fileName: 'new-avatar.png',
        originalName: 'new-avatar.png',
        fileSize: 2048,
        mimeType: 'image/png',
        bucket: 'player-avatars',
        path: 'new-avatar.png',
        entityType: 'PLAYER' as any,
        entityId: playerId,
      }

      const updatedPlayer: Player = {
        ...existingPlayer,
        avatar: uploadedFile.publicUrl,
      }

      mockPlayerRepository.findOneById.mockResolvedValue(existingPlayer)
      mockStorageService.uploadImage.mockResolvedValue(uploadedFile)
      mockPlayerRepository.updateOneById.mockResolvedValue(updatedPlayer)

      const result = await playerService.updatePlayer(playerId, { avatarFile } as any)

      expect(mockStorageService.uploadImage).toHaveBeenCalledWith({
        file: avatarFile.buffer,
        fileName: avatarFile.filename,
        mimeType: avatarFile.mimetype,
        entityType: 'PLAYER',
        entityId: playerId,
      })
      expect(result.avatar).toBe(uploadedFile.publicUrl)
    })
  })
})
