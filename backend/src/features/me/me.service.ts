import { UserRepository } from '@/features/users/users.repository'
import { UserNotFoundError } from '@/features/users/users.errors'
import { User } from '@prisma/client'

export class MyAccountService {
  private userRepository: UserRepository

  constructor({ userRepository }: { userRepository: UserRepository }) {
    this.userRepository = userRepository
  }

  async getUserData(id: string): Promise<User> {
    const userFound = await this.userRepository.findOneById(id)

    if (!userFound) {
      throw new UserNotFoundError()
    }

    return userFound
  }
}
