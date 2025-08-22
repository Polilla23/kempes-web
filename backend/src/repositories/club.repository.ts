import { IClubRepository } from 'interfaces/IClubRepository'
import { Prisma, PrismaClient } from '@prisma/client'

export class ClubRepository implements IClubRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async findAll() {
    return await this.prisma.club.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })
  }

  async findOneById(id: Prisma.ClubWhereUniqueInput['id']) {
    return await this.prisma.club.findUnique({ where: { id } })
  }

  async findOneByName(name: Prisma.ClubWhereUniqueInput['name']) {
    return await this.prisma.club.findUnique({ where: { name } })
  }

  async findOneByUserId(id: Prisma.ClubWhereUniqueInput['userId']) {
    return await this.prisma.club.findFirst({
      where: { userId: id },
    })
  }

  async save(data: Prisma.ClubCreateInput) {
    return await this.prisma.club.create({ data })
  }

  async deleteOneById(id: Prisma.ClubWhereUniqueInput['id']) {
    return await this.prisma.club.delete({ where: { id } })
  }

  async updateOneById(id: Prisma.ClubWhereUniqueInput['id'], data: Prisma.ClubUpdateInput) {
    return await this.prisma.club.update({ where: { id }, data })
  }
}
