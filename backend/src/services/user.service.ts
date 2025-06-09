import { RoleType } from '@prisma/client'
import { IUserRepository } from '../interfaces/IUserRepository'
import bcrypt from 'bcrypt'
import { User } from '@prisma/client'
import crypto from 'crypto'
import { EmailService } from './email.service'
import { RegisterUserInput } from 'utils/types'

export class UserService {
  private userRepository: IUserRepository
  private emailService: EmailService

  constructor({ userRepository, emailService }: { userRepository: IUserRepository, emailService: EmailService }) {
    this.userRepository = userRepository
    this.emailService = emailService
  }

  async registerUser({ email, password, role }: RegisterUserInput) {
    const existingUser = await this.userRepository.findOneByEmail(email)

    if (existingUser) throw new Error('User already exists.')

    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 2)

    const newUser = await this.userRepository.save({
      email,
      password: hashedPassword,
      role: role?.toUpperCase() as RoleType,
      verificationToken,
      verificationTokenExpires
    })

    const verificationLink = `${process.env.BACK_URL}/user/verify-email/${verificationToken}`
    console.log("Verification Token: ", verificationToken)
    console.log("Verification Link: ", verificationLink)
    console.log("Llegué hasta acá")
    try {
      await this.emailService.sendVerificationEmail(newUser.email, verificationLink)
    } catch (e) {
      await this.userRepository.deleteOneById(newUser.id)
      throw new Error ('Failed to send verification email. Please try registering again.')
    }
  }

  async handleEmailVerification(token: string) {
    const userFound = await this.userRepository.findOneByVerificationToken(token)
    if (!userFound || !userFound.verificationTokenExpires || userFound.verificationTokenExpires < new Date()) {
      throw new Error ('Invalid or expired token.')
    }

    await this.userRepository.verifyUser(userFound.id)
  }

  async handleResendEmailVerification(email: string): Promise<void> {
    const userFound = await this.userRepository.findOneByEmail(email);

    if (!userFound) {
      throw new Error ('User not found')
    }

    if (userFound.isVerified) {
      throw new Error ('This user not need to be verified')
    }

    const now = new Date()

    if (userFound.verificationTokenExpires && userFound.verificationTokenExpires > now) {
      const timeRemaining = Math.ceil((userFound.verificationTokenExpires.getTime() - now.getTime()) / (60 * 1000));
      throw new Error (`Please wait ${timeRemaining} minutes before requesting another verification email`)
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    userFound.verificationToken = verificationToken;
    userFound.verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 2)
    await this.userRepository.save(userFound);

    const verificationLink = `${process.env.BACK_URL}/user/verify-email/${verificationToken}`

    await this.emailService.sendVerificationEmail(userFound.email, verificationLink)
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
    }

    if (data.role) {
      data.role = data.role.toUpperCase() as RoleType
    }

    return await this.userRepository.updateOneById(id, data)
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOneById(id)
    if (!user) throw new Error('User not found')

    return await this.userRepository.deleteOneById(id)
  }
}
