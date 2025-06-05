import { IUserRepository } from '../interfaces/IUserRepository'
import { Prisma, PrismaClient, User } from '@prisma/client'

export class UserRepository implements IUserRepository {
  private prisma: PrismaClient

  constructor({prisma} : {prisma: PrismaClient}) {
    this.prisma = prisma
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    })
  }

  async save(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({ data })
  }
}
