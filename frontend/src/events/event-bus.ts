export type EventCallback<T = any> = (data: T) => void

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map()

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    this.events.get(event)!.add(callback)

    // Return unsubscribe function
    return () => this.off(event, callback)
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.events.delete(event)
      }
    }
  }

  /**
   * Emit an event
   */
  emit<T = any>(event: string, data?: T): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  /**
   * Clear all listeners for an event (or all events if no event specified)
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
}

export const eventBus = new EventBus()

// Type-safe event definitions
export const Events = {
  // Notifications
  SHOW_TOAST: 'show:toast',
  SHOW_ERROR: 'show:error',

  // Analytics
  TRACK_EVENT: 'analytics:track',

  // UI State
  SIDEBAR_TOGGLE: 'ui:sidebar:toggle',
  MODAL_OPEN: 'ui:modal:open',
  MODAL_CLOSE: 'ui:modal:close',
} as const

// Type-safe payload types
export interface ToastPayload {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

export interface AnalyticsPayload {
  action: string
  category: string
  label?: string
  value?: number
}
