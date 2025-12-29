// Crea un mapper para transformar entidades User a DTOs para no exponer info sensible

import { User } from '@prisma/client'
import { UserPublicDTO, UserProfileDTO } from '@/types'

export class UserMapper {
  static toPublicDTO(user: User): UserPublicDTO {
    return {
      id: user.id,
      email: user.email,
      name: undefined,
      role: user.role?.toString() || 'USER',
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
