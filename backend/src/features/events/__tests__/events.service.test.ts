import { EventService } from '../events.service'
import { EventRepository } from '../events.repository'
import { Prisma } from '@prisma/client'
import { CreateEvent, EventWithRelations } from '@/types'
import { EventNotFoundError } from '../events.errors'

const mockEventRepository: jest.Mocked<EventRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findManyByMatchId: jest.fn(),
  findManyByPlayerId: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
} as any

describe('EventService', () => {
  let eventService: EventService

  beforeEach(() => {
    jest.clearAllMocks()
    eventService = new EventService({
      eventRepository: mockEventRepository,
    })
  })

  describe('createEvent', () => {
    it('debería crear un evento', async () => {
      const input: CreateEvent = {
        typeId: 'event-type-1',
        playerId: 'player-1',
        matchId: 'match-1',
      }

      const expectedEvent: EventWithRelations = {
        id: '1',
        typeId: 'event-type-1',
        playerId: 'player-1',
        matchId: 'match-1',
        type: {
          id: 'event-type-1',
          name: 'GOL' as any,
          displayName: 'Gol',
          icon: null,
          isActive: true,
        },
        player: {
          id: 'player-1',
          name: 'Player Name',
        } as any,
        match: {
          id: 'match-1',
        } as any,
      }

      mockEventRepository.save.mockResolvedValue(expectedEvent)

      const result = await eventService.createEvent(input)

      expect(result).toEqual(expectedEvent)
      expect(mockEventRepository.save).toHaveBeenCalledWith({
        type: { connect: { id: input.typeId } },
        player: { connect: { id: input.playerId } },
        match: { connect: { id: input.matchId } },
      })
    })
  })

  describe('findAllEvents', () => {
    it('debería retornar todos los eventos', async () => {
      const mockEvents: EventWithRelations[] = [
        {
          id: '1',
          typeId: 'event-type-1',
          playerId: 'player-1',
          matchId: 'match-1',
          type: {
            id: 'event-type-1',
            name: 'GOL' as any,
            displayName: 'Gol',
            icon: null,
            isActive: true,
          },
          player: { id: 'player-1' } as any,
          match: { id: 'match-1' } as any,
        },
        {
          id: '2',
          typeId: 'event-type-2',
          playerId: 'player-2',
          matchId: 'match-1',
          type: {
            id: 'event-type-2',
            name: 'TARJETA_AMARILLA' as any,
            displayName: 'Tarjeta Amarilla',
            icon: null,
            isActive: true,
          },
          player: { id: 'player-2' } as any,
          match: { id: 'match-1' } as any,
        },
      ]

      mockEventRepository.findAll.mockResolvedValue(mockEvents)

      const result = await eventService.findAllEvents()

      expect(result).toEqual(mockEvents)
      expect(mockEventRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('findEventById', () => {
    it('debería retornar un evento por id', async () => {
      const mockEvent: EventWithRelations = {
        id: '1',
        typeId: 'event-type-1',
        playerId: 'player-1',
        matchId: 'match-1',
        type: {
          id: 'event-type-1',
          name: 'GOL' as any,
          displayName: 'Gol',
          icon: null,
          isActive: true,
        },
        player: { id: 'player-1' } as any,
        match: { id: 'match-1' } as any,
      }

      mockEventRepository.findOneById.mockResolvedValue(mockEvent)

      const result = await eventService.findEventById('1')

      expect(result).toEqual(mockEvent)
      expect(mockEventRepository.findOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar EventNotFoundError si no existe', async () => {
      mockEventRepository.findOneById.mockResolvedValue(null)

      await expect(eventService.findEventById('999')).rejects.toThrow(EventNotFoundError)
    })
  })

  describe('findEventsByMatchId', () => {
    it('debería retornar eventos por matchId', async () => {
      const mockEvents: EventWithRelations[] = [
        {
          id: '1',
          typeId: 'event-type-1',
          playerId: 'player-1',
          matchId: 'match-1',
          type: {
            id: 'event-type-1',
            name: 'GOL' as any,
            displayName: 'Gol',
            icon: null,
            isActive: true,
          },
          player: { id: 'player-1' } as any,
          match: { id: 'match-1' } as any,
        },
      ]

      mockEventRepository.findManyByMatchId.mockResolvedValue(mockEvents)

      const result = await eventService.findEventsByMatchId('match-1')

      expect(result).toEqual(mockEvents)
      expect(mockEventRepository.findManyByMatchId).toHaveBeenCalledWith('match-1')
    })

    it('debería lanzar EventNotFoundError si no hay eventos', async () => {
      mockEventRepository.findManyByMatchId.mockResolvedValue(null)

      await expect(eventService.findEventsByMatchId('match-999')).rejects.toThrow(EventNotFoundError)
    })
  })

  describe('findEventsByPlayerId', () => {
    it('debería retornar eventos por playerId', async () => {
      const mockEvents: EventWithRelations[] = [
        {
          id: '1',
          typeId: 'event-type-1',
          playerId: 'player-1',
          matchId: 'match-1',
          type: {
            id: 'event-type-1',
            name: 'GOL' as any,
            displayName: 'Gol',
            icon: null,
            isActive: true,
          },
          player: { id: 'player-1' } as any,
          match: { id: 'match-1' } as any,
        },
      ]

      mockEventRepository.findManyByPlayerId.mockResolvedValue(mockEvents)

      const result = await eventService.findEventsByPlayerId('player-1')

      expect(result).toEqual(mockEvents)
      expect(mockEventRepository.findManyByPlayerId).toHaveBeenCalledWith('player-1')
    })

    it('debería lanzar EventNotFoundError si no hay eventos', async () => {
      mockEventRepository.findManyByPlayerId.mockResolvedValue(null)

      await expect(eventService.findEventsByPlayerId('player-999')).rejects.toThrow(EventNotFoundError)
    })
  })

  describe('updateEvent', () => {
    it('debería actualizar un evento', async () => {
      const existingEvent: EventWithRelations = {
        id: '1',
        typeId: 'event-type-1',
        playerId: 'player-1',
        matchId: 'match-1',
        type: {
          id: 'event-type-1',
          name: 'GOL' as any,
          displayName: 'Gol',
          icon: null,
          isActive: true,
        },
        player: { id: 'player-1' } as any,
        match: { id: 'match-1' } as any,
      }

      const updateData: Prisma.EventUpdateInput = {
        type: { connect: { id: 'event-type-2' } },
      }

      const updatedEvent: EventWithRelations = {
        ...existingEvent,
        typeId: 'event-type-2',
      }

      mockEventRepository.findOneById.mockResolvedValue(existingEvent)
      mockEventRepository.updateOneById.mockResolvedValue(updatedEvent)

      const result = await eventService.updateEvent('1', updateData)

      expect(result).toEqual(updatedEvent)
      expect(mockEventRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockEventRepository.updateOneById).toHaveBeenCalledWith('1', updateData)
    })

    it('debería lanzar EventNotFoundError si no existe', async () => {
      const updateData: Prisma.EventUpdateInput = {
        type: { connect: { id: 'event-type-2' } },
      }

      mockEventRepository.findOneById.mockResolvedValue(null)

      await expect(eventService.updateEvent('999', updateData)).rejects.toThrow(EventNotFoundError)
      expect(mockEventRepository.updateOneById).not.toHaveBeenCalled()
    })
  })

  describe('deleteEvent', () => {
    it('debería eliminar un evento', async () => {
      const existingEvent: EventWithRelations = {
        id: '1',
        typeId: 'event-type-1',
        playerId: 'player-1',
        matchId: 'match-1',
        type: {
          id: 'event-type-1',
          name: 'GOL' as any,
          displayName: 'Gol',
          icon: null,
          isActive: true,
        },
        player: { id: 'player-1' } as any,
        match: { id: 'match-1' } as any,
      }

      mockEventRepository.findOneById.mockResolvedValue(existingEvent)
      mockEventRepository.deleteOneById.mockResolvedValue(undefined)

      await eventService.deleteEvent('1')

      expect(mockEventRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockEventRepository.deleteOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar EventNotFoundError si no existe', async () => {
      mockEventRepository.findOneById.mockResolvedValue(null)

      await expect(eventService.deleteEvent('999')).rejects.toThrow(EventNotFoundError)
      expect(mockEventRepository.deleteOneById).not.toHaveBeenCalled()
    })
  })
})
