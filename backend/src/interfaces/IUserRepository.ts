import { Prisma, User } from "@prisma/client"

export interface IUserRepository {
  findOneByEmail(email: string): Promise<any | null>
  save(data: Prisma.UserCreateInput): Promise<User>
}
