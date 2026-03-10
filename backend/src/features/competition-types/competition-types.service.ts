import { Prisma } from '@prisma/client'
import { ICompetitionTypeRepository } from '@/features/competition-types/interface/ICompetitionTypeRepository'
import { CreateCompetitionTypeInput } from '@/types'
import { StorageService } from '@/features/storage/storage.service'

// Errors
import {
  CompetitionTypeAlreadyExistsError,
  CompetitionTypeNotFoundError,
} from '@/features/competition-types/competition-types.errors'

export class CompetitionTypeService {
  private competitionTypeRepository: ICompetitionTypeRepository
  private storageService: StorageService

  constructor({
    competitionTypeRepository,
    storageService,
  }: {
    competitionTypeRepository: ICompetitionTypeRepository
    storageService: StorageService
  }) {
    this.competitionTypeRepository = competitionTypeRepository
    this.storageService = storageService
  }

  async findAllCompetitionTypes() {
    return await this.competitionTypeRepository.findAll()
  }

  async findCompetitionType(id: string) {
    const competitionType = await this.competitionTypeRepository.findOneById(id)

    if (!competitionType) {
      throw new CompetitionTypeNotFoundError()
    }
    return competitionType
  }

  async createCompetitionType({
    hierarchy,
    name,
    format,
    category,
    trophyImage,
  }: CreateCompetitionTypeInput & {
    trophyImageFile?: { buffer: Buffer; filename: string; mimetype: string }
  }) {
    const competitionTypeFound = await this.competitionTypeRepository.findOneByNameAndCategory(name, category)
    if (competitionTypeFound) {
      throw new CompetitionTypeAlreadyExistsError()
    }

    let trophyImageUrl = trophyImage

    // Subir imagen de trofeo si se proporciona
    if ((this as any).trophyImageFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: (this as any).trophyImageFile.buffer,
        fileName: (this as any).trophyImageFile.filename,
        mimeType: (this as any).trophyImageFile.mimetype,
        entityType: 'TROPHY',
      })
      trophyImageUrl = uploadResult.publicUrl
    }

    const competitionTypeData: Prisma.CompetitionTypeCreateInput = {
      hierarchy,
      name,
      format,
      category,
      trophyImage: trophyImageUrl,
    }

    const newCompetitionType = await this.competitionTypeRepository.save(competitionTypeData)
    return newCompetitionType
  }

  async updateCompetitionType(
    id: string,
    data: Prisma.CompetitionTypeUpdateInput & {
      trophyImageFile?: { buffer: Buffer; filename: string; mimetype: string }
    },
  ) {
    const competitionType = await this.competitionTypeRepository.findOneById(id)
    if (!competitionType) {
      throw new CompetitionTypeNotFoundError()
    }

    let updateData = { ...data }

    // Subir nueva imagen de trofeo si se proporciona
    if ((updateData as any).trophyImageFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: (updateData as any).trophyImageFile.buffer,
        fileName: (updateData as any).trophyImageFile.filename,
        mimeType: (updateData as any).trophyImageFile.mimetype,
        entityType: 'TROPHY',
        entityId: id,
      })
      updateData.trophyImage = uploadResult.publicUrl
      delete (updateData as any).trophyImageFile
    }

    return await this.competitionTypeRepository.updateOneById(id, updateData)
  }

  async deleteCompetitionType(id: string) {
    const competitionType = await this.competitionTypeRepository.findOneById(id)
    if (!competitionType) {
      throw new CompetitionTypeNotFoundError()
    }

    return await this.competitionTypeRepository.deleteOneById(id)
  }
}
