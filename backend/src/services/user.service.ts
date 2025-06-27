import { RoleType } from '@prisma/client'
import { IUserRepository } from '../interfaces/IUserRepository'
import bcrypt from 'bcrypt'
import { User } from '@prisma/client'
import crypto from 'crypto'
import { EmailService } from './email.service'
import { RegisterUserInput } from 'utils/types'
import { JWT } from '@fastify/jwt'

// Errors
import { UserAlreadyExistsError } from '../errors/userAlreadyExistsError'
import { EmailSendError } from '../errors/emailSendError'
import { AuthenticationError } from '../errors/authenticationError'
import { GenerateTokenError } from '../errors/generateTokenError'
import { UserNotFoundError } from '../errors/userNotFoundError'
import { EmailNotVerifiedError } from '../errors/emailNotVerifiedError'
import { InvalidTokenError } from '../errors/invalidTokenError'
import { EmailAlreadyVerifiedError } from '../errors/emailAlreadyVerifiedError'
import { SamePasswordError } from '../errors/samePasswordError'

export class UserService {
  private userRepository: IUserRepository
  private emailService: EmailService
  private jwtService: JWT

  constructor({
    userRepository,
    emailService,
    jwtService,
  }: {
    userRepository: IUserRepository
    emailService: EmailService
    jwtService: JWT
  }) {
    this.userRepository = userRepository
    this.emailService = emailService
    this.jwtService = jwtService
  }

  async registerUser({ email, password, role }: RegisterUserInput) {
    const existingUser = await this.userRepository.findOneByEmail(email)

    if (existingUser) {
      throw new UserAlreadyExistsError()
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 2)

    const newUser = await this.userRepository.save({
      email,
      password: hashedPassword,
      role: role?.toUpperCase() as RoleType,
      verificationToken,
      verificationTokenExpires,
    })

    const verificationLink = `${process.env.BACK_URL}/verify-email/${verificationToken}`

    try {
      await this.emailService.sendVerificationEmail(newUser.email, verificationLink)
    } catch (e) {
      await this.userRepository.deleteOneById(newUser.id)
      throw new EmailSendError()
    }
  }

  async loginUser(email: string, password: string) {
    const existingUser = await this.userRepository.findOneByEmail(email)

    if (!existingUser) {
      throw new AuthenticationError()
    }

    if (!existingUser.isVerified) {
      throw new EmailNotVerifiedError()
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

  async handleEmailVerification(token: string): Promise<void> {
    const userFound = await this.userRepository.findOneByVerificationToken(token)
    if (
      !userFound ||
      !userFound.verificationTokenExpires ||
      userFound.verificationTokenExpires < new Date()
    ) {
      throw new InvalidTokenError()
    }

    await this.userRepository.verifyUser(userFound.id)
  }

  async handleResendEmailVerification(email: string): Promise<void> {
    const userFound = await this.userRepository.findOneByEmail(email)

    if (!userFound) {
      throw new UserNotFoundError()
    }

    if (userFound.isVerified) {
      throw new EmailAlreadyVerifiedError()
    }

    const now = new Date()

    if (userFound.verificationTokenExpires && userFound.verificationTokenExpires > now) {
      const timeRemaining = Math.ceil(
        (userFound.verificationTokenExpires.getTime() - now.getTime()) / (60 * 1000)
      )
      throw new Error(`Please wait ${timeRemaining} minutes before requesting another verification email`)
    }

    const verificationToken = crypto.randomBytes(20).toString('hex')
    userFound.verificationToken = verificationToken
    userFound.verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 2)
    await this.userRepository.update(userFound)

    const verificationLink = `${process.env.BACK_URL}/verify-email/${verificationToken}`

    await this.emailService.sendVerificationEmail(userFound.email, verificationLink)
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
      throw new Error(`Please wait ${timeRemaining} minutes before requesting another reset password`)
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
