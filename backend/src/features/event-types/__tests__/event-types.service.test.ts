import { EventTypeService } from '../event-types.service'
import { IEventTypeRepository } from '../interface/IEventTypeRepository'
import { EventType, Prisma } from '@prisma/client'
import { EventTypeNotFoundError, EventTypeAlreadyExistsError } from '../event-types.errors'

const mockEventTypeRepository: jest.Mocked<IEventTypeRepository> = {
  save: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOneByName: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
}

describe('EventTypeService', () => {
  let eventTypeService: EventTypeService

  beforeEach(() => {
    jest.clearAllMocks()
    eventTypeService = new EventTypeService({
      eventTypeRepository: mockEventTypeRepository,
    })
  })

  describe('findAllEventTypes', () => {
    it('debería retornar todos los tipos de eventos', async () => {
      const mockEventTypes: EventType[] = [
        {
          id: '1',
          name: 'GOL' as any,
          displayName: 'Gol',
          icon: '⚽',
          isActive: true,
        },
        {
          id: '2',
          name: 'TARJETA_AMARILLA' as any,
          displayName: 'Tarjeta Amarilla',
          icon: '🟨',
          isActive: true,
        },
      ]

      mockEventTypeRepository.findAll.mockResolvedValue(mockEventTypes)

      const result = await eventTypeService.findAllEventTypes()

      expect(result).toEqual(mockEventTypes)
      expect(mockEventTypeRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('findEventTypeById', () => {
    it('debería retornar un tipo de evento por id', async () => {
      const mockEventType: EventType = {
        id: '1',
        name: 'GOL' as any,
        displayName: 'Gol',
        icon: '⚽',
        isActive: true,
      }

      mockEventTypeRepository.findOneById.mockResolvedValue(mockEventType)

      const result = await eventTypeService.findEventTypeById('1')

      expect(result).toEqual(mockEventType)
      expect(mockEventTypeRepository.findOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar EventTypeNotFoundError si no existe', async () => {
      mockEventTypeRepository.findOneById.mockResolvedValue(null)

      await expect(eventTypeService.findEventTypeById('999')).rejects.toThrow(EventTypeNotFoundError)
    })
  })

  describe('createEventType', () => {
    it('debería crear un tipo de evento', async () => {
      const input: Prisma.EventTypeCreateInput = {
        name: 'GOL' as any,
        displayName: 'Gol',
        icon: '⚽',
      }

      const expectedEventType: EventType = {
        id: '1',
        name: 'GOL' as any,
        displayName: 'Gol',
        icon: '⚽',
        isActive: true,
      }

      mockEventTypeRepository.findOneByName.mockResolvedValue(null)
      mockEventTypeRepository.save.mockResolvedValue(expectedEventType)

      const result = await eventTypeService.createEventType(input)

      expect(result).toEqual(expectedEventType)
      expect(mockEventTypeRepository.findOneByName).toHaveBeenCalledWith('GOL')
      expect(mockEventTypeRepository.save).toHaveBeenCalledWith(input)
    })

    it('debería lanzar EventTypeAlreadyExistsError si el nombre ya existe', async () => {
      const input: Prisma.EventTypeCreateInput = {
        name: 'GOL' as any,
        displayName: 'Gol',
        icon: '⚽',
      }

      const existingEventType: EventType = {
        id: '1',
        name: 'GOL' as any,
        displayName: 'Gol',
        icon: '⚽',
        isActive: true,
      }

      mockEventTypeRepository.findOneByName.mockResolvedValue(existingEventType)

      await expect(eventTypeService.createEventType(input)).rejects.toThrow(EventTypeAlreadyExistsError)
      expect(mockEventTypeRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('updateEventType', () => {
    it('debería actualizar un tipo de evento', async () => {
      const existingEventType: EventType = {
        id: '1',
        name: 'GOL' as any,
        displayName: 'Gol',
        icon: '⚽',
        isActive: true,
      }

      const updateData: Prisma.EventTypeUpdateInput = {
        displayName: 'Gol de Penal',
      }

      const updatedEventType: EventType = {
        ...existingEventType,
        displayName: 'Gol de Penal',
      }

      mockEventTypeRepository.findOneById.mockResolvedValue(existingEventType)
      mockEventTypeRepository.updateOneById.mockResolvedValue(updatedEventType)

      const result = await eventTypeService.updateEventType('1', updateData)

      expect(result).toEqual(updatedEventType)
      expect(mockEventTypeRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockEventTypeRepository.updateOneById).toHaveBeenCalledWith('1', updateData)
    })

    it('debería lanzar EventTypeNotFoundError si no existe', async () => {
      const updateData: Prisma.EventTypeUpdateInput = {
        displayName: 'Gol de Penal',
      }

      mockEventTypeRepository.findOneById.mockResolvedValue(null)

      await expect(eventTypeService.updateEventType('999', updateData)).rejects.toThrow(
        EventTypeNotFoundError,
      )
      expect(mockEventTypeRepository.updateOneById).not.toHaveBeenCalled()
    })
  })

  describe('deleteEventType', () => {
    it('debería eliminar un tipo de evento', async () => {
      const existingEventType: EventType = {
        id: '1',
        name: 'GOL' as any,
        displayName: 'Gol',
        icon: '⚽',
        isActive: true,
      }

      mockEventTypeRepository.findOneById.mockResolvedValue(existingEventType)
      mockEventTypeRepository.deleteOneById.mockResolvedValue(existingEventType)

      const result = await eventTypeService.deleteEventType('1')

      expect(result).toEqual(existingEventType)
      expect(mockEventTypeRepository.findOneById).toHaveBeenCalledWith('1')
      expect(mockEventTypeRepository.deleteOneById).toHaveBeenCalledWith('1')
    })

    it('debería lanzar EventTypeNotFoundError si no existe', async () => {
      mockEventTypeRepository.findOneById.mockResolvedValue(null)

      await expect(eventTypeService.deleteEventType('999')).rejects.toThrow(EventTypeNotFoundError)
      expect(mockEventTypeRepository.deleteOneById).not.toHaveBeenCalled()
    })
  })
})
