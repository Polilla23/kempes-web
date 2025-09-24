import { useCallback } from 'react'

type EventType = 'created' | 'updated' | 'deleted' | 'dialog-close'
type EntityType = 'club' | 'player' | 'user' | 'salary rate'

export interface ManagementEvent {
  action: EventType
  entity: EntityType
  payload?: any
}

const managementEventListeners: ((event: ManagementEvent) => void)[] = []

export const useManagementEvents = () => {
  const emitEvent = useCallback((event: ManagementEvent) => {
    managementEventListeners.forEach((listener) => listener(event))
  }, [])

  const subscribe = useCallback((listener: (event: ManagementEvent) => void) => {
    managementEventListeners.push(listener)
    return () => {
      const index = managementEventListeners.indexOf(listener)
      if (index !== -1) {
        managementEventListeners.splice(index, 1)
      }
    }
  }, [])

  const emitClubEvent = useCallback(
    (action: EventType, payload?: any) => {
      emitEvent({ entity: 'club', action, payload })
    },
    [emitEvent]
  )

  const emitPlayerEvent = useCallback(
    (action: EventType, payload?: any) => {
      emitEvent({ entity: 'player', action, payload })
    },
    [emitEvent]
  )

  const emitUserEvent = useCallback(
    (action: EventType, payload?: any) => {
      emitEvent({ entity: 'user', action, payload })
    },
    [emitEvent]
  )

  return {
    emitEvent,
    subscribe,
    emitClubEvent,
    emitPlayerEvent,
    emitUserEvent,
  }
}
