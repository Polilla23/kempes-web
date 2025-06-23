import { IPlayerRespository } from '../interfaces/IPlayerRepository'
import { Player } from '@prisma/client'
import { parseDateFromDDMMYYYY } from '../utils/date'
import { CreatePlayerInput } from '../utils/types'

// Errors
import { PlayerNotFoundError } from '../errors/playerNotFoundError'

export class PlayerService {
  private playerRepository: IPlayerRespository

  constructor({ playerRepository }: { playerRepository: IPlayerRespository }) {
    this.playerRepository = playerRepository
  }

  async createPlayer({
    name,
    lastName,
    birthdate,
    actualClubId,
    overall,
    salary,
    sofifaId,
    transfermarktId,
    isKempesita,
    isActive,
  }: CreatePlayerInput) {
    const birthdateAsDate = parseDateFromDDMMYYYY(birthdate)

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
      ownerClub: { connect: { id: actualClubId } },
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
}
