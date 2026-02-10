import { IClubRepository } from '@/features/clubs/interfaces/IClubRepository'
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
            email: true,
          },
        },
      },
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

  async saveMany(data: Prisma.ClubCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return await this.prisma.club.createMany({
      data,
      skipDuplicates: true,
    })
  }

  async deleteOneById(id: Prisma.ClubWhereUniqueInput['id']) {
    return await this.prisma.club.delete({ where: { id } })
  }

  async updateOneById(id: Prisma.ClubWhereUniqueInput['id'], data: Prisma.ClubUpdateInput) {
    return await this.prisma.club.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
  }

  async findAvailableClubs() {
    return await this.prisma.club.findMany({
      where: {
        userId: null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        logo: true,
      },
      orderBy: { name: 'asc' },
    })
  }

  async getActivePlayers(clubId: string) {
    return await this.prisma.player.findMany({
      where: {
        actualClubId: clubId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        overall: true,
      },
      orderBy: [{ lastName: 'asc' }, { name: 'asc' }],
    })
  }
}
