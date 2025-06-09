import { IUserRepository } from '../interfaces/IUserRepository'
import { Prisma, PrismaClient, User } from '@prisma/client'

export class UserRepository implements IUserRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findOneByEmail(email: Prisma.UserWhereUniqueInput['email']) {
    return await this.prisma.user.findUnique({
      where: { email },
    })
  }

  async findAll() {
    return await this.prisma.user.findMany()
  }

  async findOneById(id: Prisma.UserWhereUniqueInput['id']) {
    return await this.prisma.user.findUnique({
      where: { id },
    })
  }

  async findOneByVerificationToken(token: string) {
    return await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
      }
    })
  }

  async verifyUser(id: Prisma.UserWhereUniqueInput['id']) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      }
    })
  }

  async updateOneById(id: Prisma.UserWhereUniqueInput['id'], data: Prisma.UserUpdateInput) {
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data,
    })
  }

  async deleteOneById(id: Prisma.UserWhereUniqueInput['id']) {
    return await this.prisma.user.delete({
      where: { id: id },
    })
  }

  async save(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({ data })
  }
}
