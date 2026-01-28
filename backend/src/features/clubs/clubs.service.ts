import { Prisma } from '@prisma/client'
import { IClubRepository } from '@/features/clubs/interfaces/IClubRepository'
import { CreateClubInput } from '@/types'
import { ClubNotFoundError, ClubAlreadyExistsError } from '@/features/clubs/clubs.errors'
import { StorageService } from '@/features/storage/storage.service'

export class ClubService {
  private clubRepository: IClubRepository
  private storageService: StorageService

  constructor({
    clubRepository,
    storageService,
  }: {
    clubRepository: IClubRepository
    storageService: StorageService
  }) {
    this.clubRepository = clubRepository
    this.storageService = storageService
  }

  async findAllClubs() {
    return await this.clubRepository.findAll()
  }

  async findClub(id: string) {
    const clubFound = await this.clubRepository.findOneById(id)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }
    return clubFound
  }

  async createClub({
    name,
    logo,
    userId,
    isActive,
  }: CreateClubInput & {
    logoFile?: { buffer: Buffer; filename: string; mimetype: string }
  }) {
    const clubFound = await this.clubRepository.findOneByName(name)

    if (clubFound) {
      throw new ClubAlreadyExistsError()
    }

    let logoUrl = logo

    // Si viene un archivo, subirlo a Supabase
    if ((this as any).logoFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: (this as any).logoFile.buffer,
        fileName: (this as any).logoFile.filename,
        mimeType: (this as any).logoFile.mimetype,
        entityType: 'CLUB',
      })
      logoUrl = uploadResult.publicUrl
    }

    const clubData: Prisma.ClubCreateInput = {
      name,
      logo: logoUrl as string,
      isActive: isActive ?? true,
    }

    // Only connect user if userId is provided
    if (userId) {
      clubData.user = { connect: { id: userId } }
    }

    const newClub = await this.clubRepository.save(clubData)

    // Update entityId in StorageFile if logo was uploaded
    if ((this as any).logoFile && logoUrl) {
      // The entityId is now available from newClub.id
      // Note: This would require a method in StorageService to update entityId
    }

    return newClub
  }

  async updateClub(
    id: string,
    data: Prisma.ClubUpdateInput & {
      logoFile?: { buffer: Buffer; filename: string; mimetype: string }
    },
  ) {
    const clubFound = await this.clubRepository.findOneById(id)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }

    let updateData = { ...data }

    // Si viene un nuevo logo, subirlo
    if ((updateData as any).logoFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: (updateData as any).logoFile.buffer,
        fileName: (updateData as any).logoFile.filename,
        mimeType: (updateData as any).logoFile.mimetype,
        entityType: 'CLUB',
        entityId: id,
      })
      updateData.logo = uploadResult.publicUrl
      delete (updateData as any).logoFile
    }

    const result = await this.clubRepository.updateOneById(id, updateData)

    return result
  }

  async deleteClub(id: string) {
    const clubFound = await this.clubRepository.findOneById(id)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }

    return await this.clubRepository.updateOneById(id, { isActive: false })
  }
}
