import { Prisma } from '@prisma/client'
import { IClubRepository } from '@/features/clubs/interfaces/IClubRepository'
import { CreateClubInput } from '@/types'
import { ClubNotFoundError, ClubAlreadyExistsError } from '@/features/clubs/clubs.errors'

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

  async createClub({ name, logo, userId, isActive }: CreateClubInput) {
    const clubFound = await this.clubRepository.findOneByName(name)

    if (clubFound) {
      throw new ClubAlreadyExistsError()
    }

    const clubData: Prisma.ClubCreateInput = {
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

  async updateClub(id: string, data: Prisma.ClubUpdateInput) {
    const clubFound = await this.clubRepository.findOneById(id)

    if (!clubFound) {
      throw new ClubNotFoundError()
    }

    const result = await this.clubRepository.updateOneById(id, data)
    
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
