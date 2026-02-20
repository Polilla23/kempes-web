import bcrypt from 'bcrypt'
import { JWT } from '@fastify/jwt'
import crypto from 'crypto'
import { RoleType } from '@prisma/client'
import { User } from '@prisma/client'
import { EmailService } from '@/features/core/email/email.service'
import { IUserRepository } from '@/features/users/interface/IUserRepository'
import { IClubRepository } from '@/features/clubs/interfaces/IClubRepository'
import { UserAlreadyExistsError, UserNotFoundError, UsernameAlreadyTakenError } from '@/features/users/users.errors'
import { CreateUserInput } from '@/types'
import {
  AuthenticationError,
  GenerateTokenError,
  AccountPendingApprovalError,
  SamePasswordError,
} from '@/features/users/auth.errors'

export class UserService {
  private userRepository: IUserRepository
  private clubRepository: IClubRepository
  private emailService: EmailService
  private jwtService: JWT

  constructor({
    userRepository,
    clubRepository,
    emailService,
    jwtService,
  }: {
    userRepository: IUserRepository
    clubRepository: IClubRepository
    emailService: EmailService
    jwtService: JWT
  }) {
    this.userRepository = userRepository
    this.clubRepository = clubRepository
    this.emailService = emailService
    this.jwtService = jwtService
  }

  async registerUser({ email, password, username, role, clubId }: CreateUserInput) {
    const existingUser = await this.userRepository.findOneByEmail(email)

    if (existingUser) {
      throw new UserAlreadyExistsError()
    }

    // Validate username uniqueness
    const existingUsername = await this.userRepository.findOneByUsername(username)
    if (existingUsername) {
      throw new UsernameAlreadyTakenError()
    }

    // Validate club exists and is available
    const club = await this.clubRepository.findOneById(clubId)
    if (!club) {
      throw new Error('Club not found')
    }
    if (club.userId) {
      throw new Error('Club already has an owner')
    }
    if (!club.isActive) {
      throw new Error('Club is not active')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await this.userRepository.save({
      email,
      password: hashedPassword,
      username,
      role: role?.toUpperCase() as RoleType,
    })

    // Assign club to user immediately
    await this.clubRepository.updateOneById(clubId, {
      user: { connect: { id: newUser.id } },
    })
  }

  async loginUser(email: string, password: string) {
    const existingUser = await this.userRepository.findOneByEmail(email)

    if (!existingUser) {
      throw new AuthenticationError()
    }

    if (!existingUser.isVerified) {
      throw new AccountPendingApprovalError()
    }

    const matchPw = await bcrypt.compare(password, existingUser.password)

    if (!matchPw) {
      throw new AuthenticationError()
    }

    const token = this.jwtService.sign(
      { id: existingUser.id as string, role: existingUser.role },
      { expiresIn: '1h' }
    )

    if (!token) {
      throw new GenerateTokenError()
    }

    return token
  }

  async logOutUser(id: string) {
    const userFound = await this.userRepository.findOneById(id)

    if (!userFound) {
      throw new UserNotFoundError()
    }
  }

  async handleRequestPasswordReset(email: string): Promise<void> {
    const userFound = await this.userRepository.findOneByEmail(email)

    if (!userFound) {
      throw new UserNotFoundError()
    }

    const now = new Date()

    if (userFound.resetPasswordTokenExpires && userFound.resetPasswordTokenExpires > now) {
      const timeRemaining = Math.ceil(
        (userFound.resetPasswordTokenExpires.getTime() - now.getTime()) / (60 * 1000)
      )
      throw new Error(`Please wait ${timeRemaining} minutes before requesting another reset password.`)
    }

    const resetPasswordToken = crypto.randomBytes(20).toString('hex')
    userFound.resetPasswordToken = resetPasswordToken
    userFound.resetPasswordTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 2)
    await this.userRepository.update(userFound)

    const resetLink = `${process.env.BACK_URL}/reset-password/${resetPasswordToken}`

    await this.emailService.sendPasswordResetEmail(userFound.email, resetLink)
  }

  async handleResetPassword(token: string, password: string): Promise<void> {
    const userFound = await this.userRepository.findOneByResetPasswordToken(token)

    if (!userFound) {
      throw new UserNotFoundError()
    }

    const isSamePassword = await bcrypt.compare(password, userFound.password)

    if (isSamePassword) {
      throw new SamePasswordError()
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    userFound.password = hashedPassword
    userFound.resetPasswordToken = null
    userFound.resetPasswordTokenExpires = null
    await this.userRepository.update(userFound)
  }

  async findOneByResetPasswordToken(token: string) {
    return await this.userRepository.findOneByResetPasswordToken(token)
  }

  async findAllUsers() {
    return await this.userRepository.findAll()
  }

  async updateUser(id: string, data: Partial<User>) {
    const userFound = await this.userRepository.findOneById(id)

    if (!userFound) {
      throw new UserNotFoundError()
    }

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
    const userFound = await this.userRepository.findOneById(id)

    if (!userFound) {
      throw new UserNotFoundError()
    }

    return await this.userRepository.deleteOneById(id)
  }
}
