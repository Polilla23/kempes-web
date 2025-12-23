import { PlayerService } from '../players.service'
import { IPlayerRespository } from '../interface/IPlayerRepository'
import { PlayerErrors } from '../players.errors'
import { Player } from '@prisma/client'
import { CreateBasicPlayerInput } from '@/types'

// Mock del repositorio
const mockPlayerRepository: jest.Mocked<IPlayerRespository> = {
  save: jest.fn(),
  saveMany: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
}

describe('PlayerService', () => {
  let playerService: PlayerService

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks()

    // Crear una nueva instancia del servicio con el mock
    playerService = new PlayerService({ playerRepository: mockPlayerRepository })
  })

  describe('createPlayer', () => {
    it('debería crear un jugador con valores por defecto cuando solo se envían campos básicos', async () => {
      // Arrange (preparar)
      const input: CreateBasicPlayerInput = {
        name: 'Lionel',
        lastName: 'Messi',
        birthdate: new Date('1987-06-24'),
      }

      const expectedPlayer: Player = {
        id: '123',
        name: 'Lionel',
        lastName: 'Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'null',
        ownerClubId: 'null',
        overall: 50,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true,
      }

      mockPlayerRepository.save.mockResolvedValue(expectedPlayer)

      // Act (ejecutar)
      const result = await playerService.createPlayer(input)

      // Assert (verificar)
      expect(result).toEqual(expectedPlayer)
      expect(mockPlayerRepository.save).toHaveBeenCalledTimes(1)
      expect(mockPlayerRepository.save).toHaveBeenCalledWith({
        name: 'Lionel',
        lastName: 'Messi',
        birthdate: expect.any(Date),
        overall: 50,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true,
      })
    })

    it('debería usar los valores proporcionados en lugar de los defaults', async () => {
      // Arrange
      const input: CreateBasicPlayerInput = {
        name: 'Cristiano',
        lastName: 'Ronaldo',
        birthdate: new Date('1985-02-05'),
        overall: 91,
        salary: 500000,
        sofifaId: '20801',
        transfermarktId: '8198',
        actualClubId: 'club-123',
      }

      const expectedPlayer: Player = {
        id: '456',
        name: 'Cristiano',
        lastName: 'Ronaldo',
        birthdate: new Date('1985-02-05'),
        actualClubId: 'club-123',
        ownerClubId: 'null',
        overall: 91,
        salary: 500000,
        sofifaId: '20801',
        transfermarktId: '8198',
        isKempesita: false,
        isActive: true,
      }

      mockPlayerRepository.save.mockResolvedValue(expectedPlayer)

      // Act
      const result = await playerService.createPlayer(input)

      // Assert
      expect(result).toEqual(expectedPlayer)
      expect(mockPlayerRepository.save).toHaveBeenCalledWith({
        name: 'Cristiano',
        lastName: 'Ronaldo',
        birthdate: expect.any(Date),
        overall: 91,
        salary: 500000,
        sofifaId: '20801',
        transfermarktId: '8198',
        isKempesita: false,
        isActive: true,
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
          name: 'Lionel',
          lastName: 'Messi',
          birthdate: new Date('1987-06-24'),
          actualClubId: 'club-1',
          ownerClubId: 'null',
          overall: 93,
          salary: 100000,
          sofifaId: null,
          transfermarktId: null,
          isKempesita: false,
          isActive: true,
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
        name: 'Lionel',
        lastName: 'Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'club-1',
        ownerClubId: 'null',
        overall: 93,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true,
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
        name: 'Lionel',
        lastName: 'Messi',
        birthdate: new Date('1987-06-24'),
        actualClubId: 'club-1',
        ownerClubId: 'null',
        overall: 93,
        salary: 100000,
        sofifaId: null,
        transfermarktId: null,
        isKempesita: false,
        isActive: true,
      }

      mockPlayerRepository.findOneById.mockResolvedValue(deletedPlayer)
      mockPlayerRepository.deleteOneById.mockResolvedValue(deletedPlayer)

      // Act
      const result = await playerService.deletePlayer(playerId)

      // Assert
      expect(result).toEqual(deletedPlayer)
      expect(mockPlayerRepository.findOneById).toHaveBeenCalledWith(playerId)
      expect(mockPlayerRepository.deleteOneById).toHaveBeenCalledWith(playerId)
    })
  })

  describe('Error Handling', () => {
    it('debería lanzar ValidationError con birthdate inválida', async () => {
      // Arrange
      const input: CreateBasicPlayerInput = {
        name: 'Test',
        lastName: 'Player',
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
      const invalidCSV = `name;lastName;birthdate
Lionel;Messi;24/06/1987`

      // Act & Assert (falta actualClubId y overall)
      await expect(playerService.processCSVFile(invalidCSV)).rejects.toThrow(PlayerErrors.CSV)
    })

    it('debería lanzar CSV error con formato de fecha inválido', async () => {
      // Arrange
      const invalidCSV = `name;lastName;birthdate;actualClubId;overall
Lionel;Messi;fecha-invalida;club-123;90`

      // Act & Assert
      await expect(playerService.processCSVFile(invalidCSV)).rejects.toThrow(PlayerErrors.CSV)
    })
  })
})
