import { parse } from 'csv-parse/sync'
import { Prisma } from '@prisma/client'
import { IClubRepository } from '@/features/clubs/interfaces/IClubRepository'
import { CreateClubInput } from '@/types'
import { ClubNotFoundError, ClubAlreadyExistsError, ClubErrors } from '@/features/clubs/clubs.errors'
import { StorageService } from '@/features/storage/storage.service'
import { validateString, validateBoolean } from '@/features/utils/validation'

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

  async findAvailableClubs() {
    return await this.clubRepository.findAvailableClubs()
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
    logoFile,
  }: CreateClubInput & {
    logoFile?: { buffer: Buffer; filename: string; mimetype: string }
  }) {
    const clubFound = await this.clubRepository.findOneByName(name)

    if (clubFound) {
      throw new ClubAlreadyExistsError()
    }

    const clubData: Prisma.ClubCreateInput = {
      name,
      logo: logo ?? null,
      isActive: isActive ?? true,
    }

    if (userId) {
      clubData.user = { connect: { id: userId } }
    }

    const newClub = await this.clubRepository.save(clubData)

    if (logoFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: logoFile.buffer,
        fileName: logoFile.filename,
        mimeType: logoFile.mimetype,
        entityType: 'CLUB',
        entityId: newClub.id,
      })
      return await this.clubRepository.updateOneById(newClub.id, { logo: uploadResult.publicUrl })
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

  async getClubPlayers(clubId: string) {
    const clubFound = await this.clubRepository.findOneById(clubId)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }

    return await this.clubRepository.getActivePlayers(clubId)
  }

  async getClubTitles(clubId: string) {
    const club = await this.clubRepository.findOneById(clubId)
    if (!club) throw new ClubNotFoundError()
    return await this.clubRepository.findTitles(clubId)
  }

  async getClubSquad(clubId: string) {
    const club = await this.clubRepository.findOneById(clubId)
    if (!club) throw new ClubNotFoundError()
    return await this.clubRepository.findSquad(clubId)
  }

  async getClubHistory(clubId: string) {
    const club = await this.clubRepository.findOneById(clubId)
    if (!club) throw new ClubNotFoundError()
    return await this.clubRepository.findHistory(clubId)
  }

  async getClubFinances(clubId: string) {
    const club = await this.clubRepository.findOneById(clubId)
    if (!club) throw new ClubNotFoundError()
    return await this.clubRepository.findFinances(clubId)
  }

  async processCSVFile(csvContent: string) {
    const cleanCsvContent = csvContent.replace(/^\uFEFF/, '')

    let records: any[]
    try {
      records = parse(cleanCsvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ';',
      })
    } catch (error) {
      throw new ClubErrors.CSV('Invalid CSV format', [
        { row: 0, error: error instanceof Error ? error.message : 'Failed to parse CSV' },
      ])
    }

    if (records.length === 0) {
      throw new ClubErrors.CSV('CSV file is empty')
    }

    if (records.length > 40) {
      throw new ClubErrors.CSV('CSV file exceeds maximum of 40 clubs per upload')
    }

    const validClubs: Prisma.ClubCreateManyInput[] = []
    const errors: Array<{ row: number; error: string }> = []

    records.forEach((record: any, index: number) => {
      try {
        const clubData = this.transformCSVRecord(record)
        validClubs.push(clubData)
      } catch (error) {
        errors.push({
          row: index + 2,
          error: error instanceof Error ? error.message : 'Invalid data',
        })
      }
    })

    if (errors.length > 0) {
      throw new ClubErrors.CSV(`Found ${errors.length} validation error(s) in CSV`, errors)
    }

    try {
      const result = await this.clubRepository.saveMany(validClubs)
      return {
        success: true,
        message: `Successfully created ${result.count} club(s)`,
        count: result.count,
      }
    } catch (error) {
      throw new ClubErrors.Database(
        error instanceof Error ? error.message : 'Failed to save clubs to database',
      )
    }
  }

  private transformCSVRecord(record: any): Prisma.ClubCreateManyInput {
    const requiredFields = ['name']
    const missingFields = requiredFields.filter((field) => !record[field])

    if (missingFields.length > 0) {
      throw new ClubErrors.Validation(`Missing required fields: ${missingFields.join(', ')}`, {
        missingFields,
        record,
      })
    }

    return {
      name: validateString(record.name, 1, 100),
      isActive: record.isActive !== undefined ? validateBoolean(record.isActive) : true,
    }
  }
}
