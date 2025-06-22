import { Club } from '@prisma/client'
import { IClubRepository } from 'interfaces/IClubRepository'
import { RegisterClubInput } from 'utils/types'

export class ClubService {
  private clubRepository: IClubRepository

  constructor({ clubRepository }: { clubRepository: IClubRepository }) {
    this.clubRepository = clubRepository
  }

  async findAllClubs() {
    return await this.clubRepository.findAll()
  }

  async findClub(id: string) {
    const club = await this.clubRepository.findOneById(id)

    if (!club) throw new Error('Club not found.')
    return club
  }

  async createClub({ name, logo, userId }: RegisterClubInput) {
    const club = await this.clubRepository.findOneByName(name)

    if (club) throw new Error('Club already exists.')

    const newClub = await this.clubRepository.save({
      name,
      logo: logo as string,
      user: { connect: { id: userId } },
    })

    return newClub
  }

  async updateClub(id: string, data: Partial<Club>) {
    const club = await this.clubRepository.findOneById(id)

    if (!club) throw new Error('Club not found.')

    return await this.clubRepository.updateOneById(id, data)
  }

  async deleteClub(id: string) {
    const club = await this.clubRepository.findOneById(id)

    if (!club) throw new Error('Club not found.')

    return await this.clubRepository.deleteOneById(id)
  }
}
