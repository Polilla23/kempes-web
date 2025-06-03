import { IUserRepository } from '../interfaces/IUserRepository'
import { PrismaClient } from '@prisma/client'

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findOneByEmail(email: string) {
    return await this.prisma.findUnique({
      where: { email },
    })
  }

  async save(data: Partial<any>) {
    return await this.prisma.user.create({
      data: { data },
    })
  }
}
