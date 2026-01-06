import { EventType } from '@prisma/client'
import { EventTypeDTO } from '@/types'

export class EventTypeMapper {
    static toDTO(eventType: EventType): EventTypeDTO {
        return {
            id: eventType.id,
            name: eventType.name,
            displayName: eventType.displayName,
            icon: eventType.icon,
            isActive: eventType.isActive,
        }
    }

    static toDTOArray(eventTypes: EventType[]): EventTypeDTO[] {
        return eventTypes.map(this.toDTO)
    }
}