import { UserRepository } from '@/features/users/users.repository'
import { UserNotFoundError } from '@/features/users/users.errors'

export class MyAccountService {
  private userRepository: UserRepository

  constructor({ userRepository }: { userRepository: UserRepository }) {
    this.userRepository = userRepository
  }

  async getUserData(
    id: string
  ): Promise<{ email: string; isVerified: boolean; verificationTokenExpires: Date | any }> {
    const userFound = await this.userRepository.findOneById(id)

    if (!userFound) {
      throw new UserNotFoundError()
    }

    return {
      email: userFound.email,
      isVerified: userFound.isVerified,
      verificationTokenExpires: userFound.verificationTokenExpires,
    }
  }
}
