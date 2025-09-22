// This hook manages the state and CRUD operations for clubs.

import { ClubService } from '@/services/club.service'
import UserService from '@/services/user.service'
import type { Club, RegisterClubFormData, User } from '@/types'
import { useCallback, useState } from 'react'

export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])

  const fetchClubs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await ClubService.getClubs()
      setClubs(response.clubs || [])
      setError(null)
    } catch (error) {
      setError('Failed to fetch clubs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAvailableUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await UserService.getUsers()
      const users = response.users.filter((user) => !user.club)
      setAvailableUsers(users)
    } catch (error) {
      setError('Failed to fetch available users')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteClub = useCallback(async (clubId: string) => {
    try {
      await ClubService.deleteClub(clubId)
      await fetchClubs()
    } catch (error) {
      setError('Failed to delete club')
    }
  }, [])

  const updateClub = useCallback(async (clubId: string, clubData: RegisterClubFormData) => {
    try {
      await ClubService.updateClub(clubId, clubData)
      await fetchClubs()
    } catch (error) {
      setError('Failed to update club')
    }
  }, [])

  const createClub = useCallback(async (clubData: RegisterClubFormData) => {
    try {
      await ClubService.createClub(clubData)
      await fetchClubs()
    } catch (error) {
      setError('Failed to create club')
    }
  }, [])

  return {
    clubs,
    isLoading,
    error,
    fetchClubs,
    deleteClub,
    updateClub,
    createClub,
    fetchAvailableUsers,
    availableUsers,
    setError,
  }
}
