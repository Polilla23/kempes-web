import { Club } from '@prisma/client'
import { IClubRepository } from 'interfaces/IClubRepository'
import { RegisterClubInput } from 'utils/types'

// Errors
import { ClubNotFoundError } from '../errors/clubNotFoundError'
import { ClubAlreadyExistsError } from '../errors/clubAlreadyExistsError'

export class ClubService {
  private clubRepository: IClubRepository

  constructor({ clubRepository }: { clubRepository: IClubRepository }) {
    this.clubRepository = clubRepository
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

  async createClub({ name, logo, userId, isActive }: RegisterClubInput) {
    const clubFound = await this.clubRepository.findOneByName(name)

    if (clubFound) {
      throw new ClubAlreadyExistsError()
    }

    const clubData: any = {
      name,
      logo: logo as string,
      isActive: isActive ?? true,
    }

    // Only connect user if userId is provided
    if (userId) {
      clubData.user = { connect: { id: userId } }
    }

    const newClub = await this.clubRepository.save(clubData)

    return newClub
  }

  async updateClub(id: string, data: Partial<Club>) {
    const clubFound = await this.clubRepository.findOneById(id)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }

    return await this.clubRepository.updateOneById(id, data)
  }

  async deleteClub(id: string) {
    const clubFound = await this.clubRepository.findOneById(id)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }

    return await this.clubRepository.deleteOneById(id)
  }
}
