import { RoleType } from '@prisma/client'
import { IUserRepository } from '../interfaces/IUserRepository'
import bcrypt from 'bcrypt'

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async registerUser({
    email,
    password,
    role,
  }: {
    email: string
    password: string
    role?: 'admin' | 'user'
  }) {
    const existingUser = await this.userRepository.findOneByEmail(email)

    if (existingUser) throw new Error('User already exists.')
    const hashedPassword = await bcrypt.hash(password, 10)

    return await this.userRepository.save({ email, password: hashedPassword, role: role?.toUpperCase() as RoleType })
  }
}
