import { StorageFile, Prisma } from '@prisma/client'

export interface IStorageRepository {
  save(data: Prisma.StorageFileCreateInput): Promise<StorageFile>
  findById(id: string): Promise<StorageFile | null>
  findByEntity(entityType: string, entityId: string): Promise<StorageFile[]>
  findByBucket(bucket: string): Promise<StorageFile[]>
  updateOneById(id: string, data: Prisma.StorageFileUpdateInput): Promise<StorageFile>
  deleteOneById(id: string): Promise<void>
}
