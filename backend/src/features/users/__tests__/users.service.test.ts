import { UserService } from '../users.service'
import { IUserRepository } from '../interface/IUserRepository'
import { EmailService } from '@/features/core/email/email.service'
import { JWT } from '@fastify/jwt'
import { UserAlreadyExistsError, UserNotFoundError } from '../users.errors'
import { RoleType, User } from '@prisma/client'
import bcrypt from 'bcrypt'

// Mocks
jest.mock('bcrypt')
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-token-123'),
  })),
}))

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findOneByEmail: jest.fn(),
  findOneById: jest.fn(),
  findOneByVerificationToken: jest.fn(),
  verifyUser: jest.fn(),
  findOneByResetPasswordToken: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  updateOneById: jest.fn(),
  deleteOneById: jest.fn(),
  findAll: jest.fn(),
}

const mockEmailService: jest.Mocked<EmailService> = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
} as any

const mockJwtService: jest.Mocked<JWT> = {
  sign: jest.fn(),
  verify: jest.fn(),
} as any

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    jest.clearAllMocks()

    userService = new UserService({
      userRepository: mockUserRepository,
      emailService: mockEmailService,
      jwtService: mockJwtService,
    })
  })

  describe('registerUser', () => {
    it('debería crear un nuevo usuario con email, password hasheado y token de verificación', async () => {
      // Arrange
      const userInput = {
        email: 'test@example.com',
        password: 'Password123!',
        role: RoleType.USER,
      }

      const hashedPassword = 'hashed-password-123'
      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)

      mockUserRepository.findOneByEmail.mockResolvedValue(null)

      const mockCreatedUser: User = {
        id: 'user-123',
        email: userInput.email,
        password: hashedPassword,
        role: userInput.role,
        isVerified: false,
        verificationToken: 'mock-token-123',
        verificationTokenExpires: null,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
      }

      mockUserRepository.save.mockResolvedValue(mockCreatedUser)
      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined)

      // Act
      await userService.registerUser(userInput)

      // Assert
      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(userInput.email)
      expect(bcrypt.hash).toHaveBeenCalledWith(userInput.password, 10)
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: userInput.email,
        password: hashedPassword,
        role: userInput.role,
        verificationToken: 'mock-token-123',
        verificationTokenExpires: expect.any(Date),
      })
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        userInput.email,
        expect.stringContaining('mock-token-123')
      )
    })

    it('debería lanzar UserAlreadyExistsError si el email ya está registrado', async () => {
      // Arrange
      const userInput = {
        email: 'existing@example.com',
        password: 'Password123!',
        role: RoleType.USER,
      }

      const existingUser: User = {
        id: 'user-456',
        email: userInput.email,
        password: 'hashed',
        role: RoleType.USER,
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
      }

      mockUserRepository.findOneByEmail.mockResolvedValue(existingUser)

      // Act & Assert
      await expect(userService.registerUser(userInput)).rejects.toThrow(UserAlreadyExistsError)

      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(userInput.email)
      expect(mockUserRepository.save).not.toHaveBeenCalled()
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled()
    })
  })

  // Nota: findUserById no existe en UserService, se puede implementar si es necesario

  describe('findAllUsers', () => {
    it('debería retornar lista de todos los usuarios', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password: 'hashed',
          role: RoleType.USER,
          isVerified: true,
          verificationToken: null,
          resetPasswordToken: null,
          resetPasswordTokenExpires: null,
          verificationTokenExpires: null,
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          password: 'hashed',
          role: RoleType.ADMIN,
          isVerified: true,
          verificationToken: null,
          resetPasswordToken: null,
          resetPasswordTokenExpires: null,
          verificationTokenExpires: null,
        },
      ]

      mockUserRepository.findAll.mockResolvedValue(mockUsers)

      // Act
      const result = await userService.findAllUsers()

      // Assert
      expect(result).toEqual(mockUsers)
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1)
    })

    it('debería retornar array vacío si no hay usuarios', async () => {
      // Arrange
      mockUserRepository.findAll.mockResolvedValue([])

      // Act
      const result = await userService.findAllUsers()

      // Assert
      expect(result).toEqual([])
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1)
    })
  })
})
