import { parse } from 'csv-parse/sync'
import { Player } from '@prisma/client'
import { IPlayerRespository } from '@/features/players/interface/IPlayerRepository'
import { parseDateFromDDMMYYYY } from '@/features/utils/date'
import { CreatePlayerInput, CreateBasicPlayerInput } from '@/types'
import { validateNumber, validateBoolean, validateString } from '@/features/utils/validation'
import { PlayerErrors } from '@/features/players/players.errors'

export class PlayerService {
  private playerRepository: IPlayerRespository

  constructor({ playerRepository }: { playerRepository: IPlayerRespository }) {
    this.playerRepository = playerRepository
  }

  async createPlayer(input: CreateBasicPlayerInput) {
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

    // Crear objeto completo con valores por defecto solo si no vienen
    const playerData: any = {
      name: input.name,
      lastName: input.lastName,
      birthdate: birthdateAsDate,
      overall: input.overall ?? 50,
      salary: input.salary ?? 100000,
      sofifaId: input.sofifaId ?? null,
      transfermarktId: input.transfermarktId ?? null,
      isKempesita: false,
      isActive: true,
    }

    // Solo agregar clubs si se proporcionan
    if (input.actualClubId) {
      playerData.actualClub = { connect: { id: input.actualClubId } }
    }

    try {
      const newPlayer = await this.playerRepository.save(playerData)
      return newPlayer
    } catch (error) {
      // Si Prisma lanza error de foreign key (club no existe), lanzar error descriptivo
      if (error instanceof Error && error.message.includes('Foreign key constraint')) {
        throw new PlayerErrors.Validation('Invalid club reference', {
          field: 'actualClubId',
          value: input.actualClubId,
        })
      }
      throw error
    }
  }

  async findAllPlayers() {
    return this.playerRepository.findAll()
  }

  async updatePlayer(id: string, data: Partial<Player>) {
    const playerFound = await this.playerRepository.findOneById(id)

    if (!playerFound) {
      throw new PlayerErrors.NotFound(`Player with id ${id} not found`)
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

    return await this.playerRepository.deleteOneById(id)
  }

  async findPlayerById(id: string) {
    const playerFound = await this.playerRepository.findOneById(id)

    if (!playerFound) {
      throw new PlayerErrors.NotFound(`Player with id ${id} not found`)
    }

    return playerFound
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

    // Guardar todos los jugadores válidos
    try {
      const result = await this.playerRepository.saveMany(validPlayers)
      return {
        success: true,
        message: `Successfully created ${result.count} player(s)`,
        count: result.count,
      }
    } catch (error) {
      throw new PlayerErrors.Database(
        error instanceof Error ? error.message : 'Failed to save players to database'
      )
    }
  }

  private transformCSVRecord(record: any): CreatePlayerInput {
    const requiredFields = ['name', 'lastName', 'birthdate', 'actualClubId', 'overall']
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
      lastName: validateString(record.lastName, 1),
      birthdate: birthdateAsDate,
      actualClubId: record.actualClubId || '',
      ownerClubId: record.ownerClubId || record.actualClubId || '',
      overall: validateNumber(record.overall, 0, 99),
      salary: validateNumber(record.salary, 0),
      sofifaId: validateString(record.sofifaId || ''),
      transfermarktId: validateString(record.transfermarktId || ''),
      isKempesita: validateBoolean(record.isKempesita),
      isActive: validateBoolean(record.isActive),
    }
  }
}
