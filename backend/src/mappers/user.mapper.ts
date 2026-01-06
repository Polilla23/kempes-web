// Crea un mapper para transformar entidades User a DTOs para no exponer info sensible

import { User } from '@prisma/client'
import { UserPublicDTO, UserProfileDTO } from '@/types'

export class UserMapper {
  static toPublicDTO(user: User & { club?: { id: string; name: string } | null }): UserPublicDTO {
    return {
      id: user.id,
      email: user.email,
      name: undefined,
      role: user.role?.toString() || 'USER',
      isVerified: user.isVerified,
      club: user.club ? {
        id: user.club.id,
        name: user.club.name,
      } : null,
    }
  }

  static toProfileDTO(user: User): UserProfileDTO {
    return {
      id: user.id,
      email: user.email,
      name: undefined,
      role: user.role?.toString() || 'USER',
      createdAt: new Date().toISOString(),
    }
  }

  static toPublicDTOArray(users: User[]): UserPublicDTO[] {
    return users.map(this.toPublicDTO)
  }
}