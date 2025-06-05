import { IUserRepository } from '../interfaces/IUserRepository'
import { Prisma, PrismaClient } from '@prisma/client'

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    })
  }

  async save(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({ data })
  }
}
