import { RoleType } from '@prisma/client'
import { IUserRepository } from '../interfaces/IUserRepository'
import bcrypt from 'bcrypt'
import { User } from '@prisma/client'

export class UserService {
  private userRepository: IUserRepository

  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this.userRepository = userRepository
  }

  async registerUser({ email, password, role }: Omit<User, 'id'>) {
    const existingUser = await this.userRepository.findOneByEmail(email)

    if (existingUser) throw new Error('User already exists.')

    const hashedPassword = await bcrypt.hash(password, 10)

    return await this.userRepository.save({
      email,
      password: hashedPassword,
      role: role?.toUpperCase() as RoleType,
    })
  }

  async findAllUsers() {
    return await this.userRepository.findAll()
  }

  async updateUser(id: string, data: Partial<User>) {
    const user = await this.userRepository.findOneById(id)

    if (!user) throw new Error('User not found')

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10)
      data.password = hashedPassword

      return await this.userRepository.updateOneById(id, data)
    }

    return await this.userRepository.updateOneById(id, data)
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOneById(id)
    if (!user) throw new Error('User not found')

    return await this.userRepository.deleteOneById(id)
  }
}
