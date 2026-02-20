import { RoleType } from '@prisma/client'

export type CreateUserInput = {
  email: string
  password: string
  username: string
  role?: RoleType
  clubId: string
}
