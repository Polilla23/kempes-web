import { RoleType } from '@prisma/client'

export type CreateUserInput = {
  email: string
  password: string
  role?: RoleType
  clubId: string
}
