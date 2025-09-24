// This hook manages the state and CRUD operations for clubs.

import { ClubService } from '@/services/club.service'
import UserService from '@/services/user.service'
import type { Club, RegisterClubFormData, User } from '@/types'
import { useCallback, useState, useEffect } from 'react'

export function useClubsServices() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState<boolean>(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])

  const fetchClubs = useCallback(async () => {
    setIsLoadingClubs(true)
    try {
      const response = await ClubService.getClubs()
      setClubs(response.clubs || [])
      setError(null)
    } catch (error) {
      setError('Failed to fetch clubs')
      console.error('Error fetching clubs:', error)
    } finally {
      setIsLoadingClubs(false)
    }
  }, [])

  const fetchAvailableUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    try {
      const response = await UserService.getUsers()
      console.log('Raw users from API:', response.users)

      const users = response.users.filter((user: User) => {
        if (!user.club) {
          return true
        }
        if (typeof user.club === 'object') {
          const clubKeys = Object.keys(user.club)
          console.log(`User ${user.email} club keys:`, clubKeys)
          return clubKeys.length === 0
        }

        return false
      })

      console.log('Filtered available users:', users)
      setAvailableUsers(users)
    } catch (error) {
      setError('Failed to fetch available users')
      console.error('Error fetching users:', error)
      setAvailableUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await Promise.all([fetchClubs(), fetchAvailableUsers()])
  }, [fetchClubs, fetchAvailableUsers])

  const deleteClub = useCallback(
    async (clubId: string) => {
      try {
        await ClubService.deleteClub(clubId)
        await refetch()
      } catch (error) {
        setError('Failed to delete club')
        throw error
      }
    },
    [refetch]
  )

  const updateClub = useCallback(
    async (clubId: string, clubData: RegisterClubFormData) => {
      try {
        await ClubService.updateClub(clubId, clubData)
        await refetch()
      } catch (error) {
        setError('Failed to update club')
        throw error
      }
    },
    [refetch]
  )

  const createClub = useCallback(
    async (clubData: RegisterClubFormData) => {
      try {
        await ClubService.createClub(clubData)
        await refetch()
      } catch (error) {
        setError('Failed to create club')
        throw error
      }
    },
    [refetch]
  )

  // Auto-fetch data when hook is first used
  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    clubs,
    isLoading: isLoadingClubs || isLoadingUsers,
    isLoadingClubs,
    isLoadingUsers,
    error,
    fetchClubs,
    deleteClub,
    updateClub,
    createClub,
    fetchAvailableUsers,
    availableUsers,
    setError,
    refetch,
  }
}
