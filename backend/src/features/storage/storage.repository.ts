import { PrismaClient, StorageFile, Prisma } from '@prisma/client'
import { IStorageRepository } from './interfaces/IStorageRepository'

export class StorageRepository implements IStorageRepository {
  private prisma: PrismaClient

  constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma
  }

  async save(data: Prisma.StorageFileCreateInput): Promise<StorageFile> {
    return await this.prisma.storageFile.create({ data })
  }

  async findById(id: string): Promise<StorageFile | null> {
    return await this.prisma.storageFile.findUnique({ where: { id } })
  }

  async findByEntity(entityType: string, entityId: string): Promise<StorageFile[]> {
    return await this.prisma.storageFile.findMany({
      where: {
        entityType: entityType as any,
        entityId,
        isActive: true,
      },
    })
  }

  async findByBucket(bucket: string): Promise<StorageFile[]> {
    return await this.prisma.storageFile.findMany({
      where: { bucket, isActive: true },
    })
  }

  async updateOneById(
    id: string,
    data: Prisma.StorageFileUpdateInput
  ): Promise<StorageFile> {
    return await this.prisma.storageFile.update({
      where: { id },
      data,
    })
  }

  async deleteOneById(id: string): Promise<void> {
    await this.prisma.storageFile.delete({ where: { id } })
  }
}
