import { parse } from 'csv-parse/sync'
import { Player } from '@prisma/client'
import { IPlayerRespository } from '@/features/players/interface/IPlayerRepository'
import { parseDateFromDDMMYYYY } from '@/features/utils/date'
import { CreatePlayerInput, CreateBasicPlayerInput } from '@/types'
import { validateNumber, validateBoolean, validateString } from '@/features/utils/validation'
import { PlayerErrors } from '@/features/players/players.errors'
import { StorageService } from '@/features/storage/storage.service'
import { SalaryRateService } from '@/features/salary-rates/salary-rates.service'
import { KempesitaConfigService } from '@/features/kempesita-config/kempesita-config.service'

export class PlayerService {
  private playerRepository: IPlayerRespository
  private storageService: StorageService
  private salaryRateService: SalaryRateService
  private kempesitaConfigService: KempesitaConfigService

  constructor({
    playerRepository,
    storageService,
    salaryRateService,
    kempesitaConfigService,
  }: {
    playerRepository: IPlayerRespository
    storageService: StorageService
    salaryRateService: SalaryRateService
    kempesitaConfigService: KempesitaConfigService
  }) {
    this.playerRepository = playerRepository
    this.storageService = storageService
    this.salaryRateService = salaryRateService
    this.kempesitaConfigService = kempesitaConfigService
  }

  async createPlayer(
    input: CreateBasicPlayerInput & {
      avatarFile?: { buffer: Buffer; filename: string; mimetype: string }
    },
  ) {
    // Validación de birthdate
    const birthdateAsDate =
      typeof input.birthdate === 'string' ? parseDateFromDDMMYYYY(input.birthdate) : input.birthdate

    // Validar que la fecha sea válida
    if (isNaN(birthdateAsDate.getTime())) {
      throw new PlayerErrors.Validation('Invalid birthdate format', {
        field: 'birthdate',
        value: input.birthdate,
      })
    }

    // Auto-calcular salary e isKempesita
    const overallValue = input.overall ?? 50
    const resolvedSalary = await this.resolveSalary(overallValue)
    const resolvedIsKempesita = await this.resolveIsKempesita(birthdateAsDate)

    // Crear objeto completo con valores por defecto solo si no vienen
    const playerData: any = {
      name: input.name,
      birthdate: birthdateAsDate,
      overall: overallValue,
      salary: resolvedSalary,
      sofifaId: input.sofifaId ?? null,
      transfermarktId: input.transfermarktId ?? null,
      isKempesita: resolvedIsKempesita,
      isActive: true,
    }

    // Subir avatar si se proporciona
    if (input.avatarFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: input.avatarFile.buffer,
        fileName: input.avatarFile.filename,
        mimeType: input.avatarFile.mimetype,
        entityType: 'PLAYER',
      })
      playerData.avatar = uploadResult.publicUrl
    }

    // Solo agregar clubs si se proporcionan (y no son strings vacíos)
    if (input.actualClubId && input.actualClubId.trim() !== '') {
      playerData.actualClub = { connect: { id: input.actualClubId } }
    }

    if (input.ownerClubId && input.ownerClubId.trim() !== '') {
      playerData.ownerClub = { connect: { id: input.ownerClubId } }
    }

    try {
      const newPlayer = await this.playerRepository.save(playerData)
      return newPlayer
    } catch (error) {
      // Si Prisma lanza error de foreign key (club no existe), lanzar error descriptivo
      if (error instanceof Error && error.message.includes('Foreign key constraint')) {
        throw new PlayerErrors.Validation('Invalid club reference', {
          field: input.actualClubId ? 'actualClubId' : 'ownerClubId',
          value: input.actualClubId || input.ownerClubId,
        })
      }
      throw error
    }
  }

  async findAllPlayers() {
    return this.playerRepository.findAll()
  }

  async updatePlayer(
    id: string,
    data: Partial<Player> & {
      avatarFile?: { buffer: Buffer; filename: string; mimetype: string }
    },
  ) {
    const playerFound = await this.playerRepository.findOneById(id)

    if (!playerFound) {
      throw new PlayerErrors.NotFound(`Player with id ${id} not found`)
    }

    let updateData = { ...data }

    // Subir nuevo avatar si se proporciona
    if ((updateData as any).avatarFile) {
      const uploadResult = await this.storageService.uploadImage({
        file: (updateData as any).avatarFile.buffer,
        fileName: (updateData as any).avatarFile.filename,
        mimeType: (updateData as any).avatarFile.mimetype,
        entityType: 'PLAYER',
        entityId: id,
      })
      updateData.avatar = uploadResult.publicUrl
      delete (updateData as any).avatarFile
    }

    // Validar actualClubId si viene en el update
    if (data.actualClubId) {
    }

    try {
      return await this.playerRepository.updateOneById(id, data)
    } catch (error) {
      if (error instanceof Error && error.message.includes('Foreign key constraint')) {
        throw new PlayerErrors.Validation('Invalid club reference', {
          field: 'actualClubId',
          value: data.actualClubId,
        })
      }
      throw error
    }
  }

  async deletePlayer(id: string) {
    const playerFound = await this.playerRepository.findOneById(id)

    if (!playerFound) {
      throw new PlayerErrors.NotFound(`Player with id ${id} not found`)
    }

    return await this.playerRepository.updateOneById(id, { isActive: false })
  }

  async findPlayerById(id: string) {
    const playerFound = await this.playerRepository.findOneById(id)

    if (!playerFound) {
      throw new PlayerErrors.NotFound(`Player with id ${id} not found`)
    }

    return playerFound
  }

  async getPlayerCareer(playerId: string) {
    const player = await this.playerRepository.findOneById(playerId)
    if (!player) throw new PlayerErrors.NotFound(`Player with id ${playerId} not found`)
    return await this.playerRepository.findCareer(playerId)
  }

  async getPlayerSeasonStats(playerId: string) {
    const player = await this.playerRepository.findOneById(playerId)
    if (!player) throw new PlayerErrors.NotFound(`Player with id ${playerId} not found`)
    return await this.playerRepository.findSeasonStats(playerId)
  }

  async getPlayerTitles(playerId: string) {
    const player = await this.playerRepository.findOneById(playerId)
    if (!player) throw new PlayerErrors.NotFound(`Player with id ${playerId} not found`)
    return await this.playerRepository.findTitles(playerId)
  }

  async getPlayerTransferHistory(playerId: string) {
    const player = await this.playerRepository.findOneById(playerId)
    if (!player) throw new PlayerErrors.NotFound(`Player with id ${playerId} not found`)
    return await this.playerRepository.findTransferHistory(playerId)
  }

  async processCSVFile(csvContent: string) {
    const cleanCsvContent = csvContent.replace(/^\uFEFF/, '')

    // Parsear CSV
    let records: any[]
    try {
      records = parse(cleanCsvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ';',
      })
    } catch (error) {
      throw new PlayerErrors.CSV('Invalid CSV format', [
        {
          row: 0,
          error: error instanceof Error ? error.message : 'Failed to parse CSV',
        },
      ])
    }

    if (records.length === 0) {
      throw new PlayerErrors.CSV('CSV file is empty')
    }

    if (records.length > 60) {
      throw new PlayerErrors.CSV('CSV file exceeds maximum of 60 players per upload')
    }

    const validPlayers: CreatePlayerInput[] = []
    const errors: Array<{ row: number; error: string }> = []

    records.forEach((record: any, index: number) => {
      try {
        const playerData = this.transformCSVRecord(record)
        validPlayers.push(playerData)
      } catch (error) {
        errors.push({
          row: index + 2, // +2 para incluir header y empezar desde 1
          error: error instanceof Error ? error.message : 'Invalid data',
        })
      }
    })

    // Si hay errores de validación, lanzar excepción con detalles
    if (errors.length > 0) {
      throw new PlayerErrors.CSV(`Found ${errors.length} validation error(s) in CSV`, errors)
    }

    // Auto-calcular salary e isKempesita para cada jugador
    const playersWithAutoFields = await Promise.all(
      validPlayers.map(async (player) => ({
        ...player,
        salary: await this.resolveSalary(player.overall),
        isKempesita: await this.resolveIsKempesita(player.birthdate),
      })),
    )

    // Guardar todos los jugadores válidos
    try {
      const result = await this.playerRepository.saveMany(playersWithAutoFields)
      return {
        success: true,
        message: `Successfully created ${result.count} player(s)`,
        count: result.count,
      }
    } catch (error) {
      throw new PlayerErrors.Database(
        error instanceof Error ? error.message : 'Failed to save players to database',
      )
    }
  }

  private async resolveSalary(overall: number): Promise<number> {
    try {
      const rates = await this.salaryRateService.findAllSalaryRates()
      const matchingRate = rates?.find(
        (rate) => overall >= rate.minOverall && overall <= rate.maxOverall,
      )
      return matchingRate ? matchingRate.salary : 100000
    } catch {
      return 100000
    }
  }

  private async resolveIsKempesita(birthdate: Date): Promise<boolean> {
    try {
      const config = await this.kempesitaConfigService.getActiveConfig()
      if (!config) return false
      return birthdate.getFullYear() >= config.maxBirthYear
    } catch {
      return false
    }
  }

  private transformCSVRecord(record: any): CreatePlayerInput {
    const requiredFields = ['name', 'birthdate', 'actualClubId', 'overall']
    const missingFields = requiredFields.filter((field) => !record[field])

    if (missingFields.length > 0) {
      throw new PlayerErrors.Validation(`Missing required fields: ${missingFields.join(', ')}`, {
        missingFields,
        record,
      })
    }

    let birthdateAsDate: Date
    try {
      birthdateAsDate = parseDateFromDDMMYYYY(record.birthdate)

      if (isNaN(birthdateAsDate.getTime())) {
        throw new Error('Invalid date')
      }
    } catch (error) {
      throw new PlayerErrors.Validation(`Invalid birthdate format: ${record.birthdate}`, {
        field: 'birthdate',
        value: record.birthdate,
      })
    }

    return {
      name: validateString(record.name, 1),
      birthdate: birthdateAsDate,
      actualClubId: record.actualClubId || '',
      ownerClubId: record.ownerClubId || record.actualClubId || '',
      overall: validateNumber(record.overall, 0, 99),
      sofifaId: validateString(record.sofifaId || ''),
      transfermarktId: validateString(record.transfermarktId || ''),
      isActive: validateBoolean(record.isActive),
    }
  }
}
