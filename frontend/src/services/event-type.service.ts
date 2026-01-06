import api from './api'
import type { EventType } from '@/types'

export interface EventTypeResponse {
  eventType?: EventType
  message?: string
}

export interface EventTypesResponse {
  eventTypes: EventType[]
}

export class EventTypeService {
  static async createEventType(data: { name: string; displayName: string; icon: string; isActive: boolean }): Promise<EventTypeResponse> {
    try {
      const response = await api.post<{ data: EventType; message: string }>('/api/v1/event-types', data)
      return { eventType: response.data?.data, message: response.data?.message || 'Event type created successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating event type')
    }
  }

  static async getEventTypes(): Promise<EventTypesResponse> {
    try {
      const response = await api.get<{ data: EventType[] }>('/api/v1/event-types')
      return { eventTypes: response.data?.data || [] }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching event types')
    }
  }

  static async getEventTypeById(id: string): Promise<EventTypeResponse> {
    try {
      const response = await api.get<{ data: EventType; message: string }>(`/api/v1/event-types/${id}`)
      return { eventType: response.data?.data, message: response.data?.message || 'Event type fetched successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching event type')
    }
  }

  static async updateEventType(
    id: string,
    data: { name?: string; displayName?: string; icon?: string; isActive?: boolean }
  ): Promise<EventTypeResponse> {
    try {
      const response = await api.patch<{ data: EventType; message: string }>(`/api/v1/event-types/${id}`, data)
      return { eventType: response.data?.data, message: response.data?.message || 'Event type updated successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating event type')
    }
  }

  static async deleteEventType(id: string): Promise<EventTypeResponse> {
    try {
      const response = await api.delete<{ data: EventType; message: string }>(`/api/v1/event-types/${id}`)
      return { eventType: response.data?.data, message: response.data?.message || 'Event type deleted successfully' }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting event type')
    }
  }
}