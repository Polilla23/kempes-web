import { IPlayerRespository } from '../interfaces/IPlayerRepository'
import { Player } from '@prisma/client'
import { parseDateFromDDMMYYYY } from '../utils/date'
import { CreatePlayerInput } from '../utils/types'
import { parse } from 'csv-parse/sync'
import { validateNumber, validateBoolean, validateString } from '../utils/validation'

// Errors
import { PlayerNotFoundError } from '../errors/player.errors'

export class PlayerService {
  private playerRepository: IPlayerRespository

  constructor({ playerRepository }: { playerRepository: IPlayerRespository }) {
    this.playerRepository = playerRepository
  }

  async createPlayer({
    name,
    lastName,
    birthdate,
    overall,
    salary,
    sofifaId,
    transfermarktId,
    isKempesita,
    isActive,
    actualClubId,
    ownerClubId,
  }: CreatePlayerInput) {
    const birthdateAsDate = typeof birthdate === 'string' ? parseDateFromDDMMYYYY(birthdate) : birthdate

    const newPlayer = await this.playerRepository.save({
      name,
      lastName,
      birthdate: birthdateAsDate,
      overall,
      salary,
      sofifaId,
      transfermarktId,
      isKempesita,
      isActive,
      actualClub: { connect: { id: actualClubId } },
      ownerClub: { connect: { id: ownerClubId } },
    })

    return newPlayer
  }

  async findAllPlayers() {
    return this.playerRepository.findAll()
  }

  async updatePlayer(id: string, data: Partial<Player>) {
    const playerFound = await this.playerRepository.findOneById(id)

    if (!playerFound) {
      throw new PlayerNotFoundError()
    }

    if (data.actualClubId) {
    }

    return await this.playerRepository.updateOneById(id, data)
  }

  async deletePlayer(id: string) {
    return await this.playerRepository.deleteOneById(id)
  }

  async findPlayerById(id: string) {
    const playerFound = await this.playerRepository.findOneById(id)

    if (!playerFound) {
      throw new PlayerNotFoundError()
    }

    return playerFound
  }

  async processCSVFile(csvContent: string) {
    const cleanCsvContent = csvContent.replace(/^\uFEFF/, '')

    const records = parse(cleanCsvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
    })

    const validPlayers: CreatePlayerInput[] = []
    const errors: Array<{ row: number; error: string }> = []

    records.forEach((record: any, index: number) => {
      try {
        const playerData = this.transformCSVRecord(record)
        validPlayers.push(playerData)
      } catch (error) {
        errors.push({
          row: index + 2, // +2 para evitar el encabezado
          error: error instanceof Error ? error.message : 'Invalid data',
        })
      }
    })

    // si hay errores no se guardan los jugadores
    if (errors.length > 0) {
      return {
        success: false,
        errors,
        validPlayers: [],
      }
    }

    try {
      const result = await this.playerRepository.saveMany(validPlayers)
      return {
        success: true,
        message: `Successfully created ${result.count} players`,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save players to database',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private transformCSVRecord(record: any): CreatePlayerInput {
    const requiredFields = ['name', 'lastName', 'birthdate', 'actualClubId', 'overall']
    const missingFields = requiredFields.filter((field) => !record[field])

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields)
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    const birthdateAsDate = parseDateFromDDMMYYYY(record.birthdate)

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
