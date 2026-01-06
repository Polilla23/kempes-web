import { RoleType, User } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from '@/features/users/users.service'
import { UserMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { UserPublicDTO } from '@/types'

export class UserController {
  private userService: UserService

  constructor({ userService }: { userService: UserService }) {
    this.userService = userService
  }

  async register(req: FastifyRequest, reply: FastifyReply) {
    const { email, password, role } = req.body as {
      email: string
      password: string
      role?: 'admin' | 'user'
    }

    try {
      const validatedData = {
        email: Validator.email(email),
        password: Validator.string(password, 8, 100),
        ...(role && { role: role as RoleType }),
      }

      await this.userService.registerUser(validatedData)

      return Response.created(
        reply,
        { message: 'User registered successfully' },
        'User registered successfully'
      )
    } catch (error: any) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Validation failed',
        'Error while registering new user'
      )
    }
  }

  async logIn(req: FastifyRequest, reply: FastifyReply) {
    const { email, password } = req.body as { email: string; password: string }

    try {
      const validatedEmail = Validator.email(email)
      const validatedPassword = Validator.string(password, 1, 100)

      const token = await this.userService.loginUser(validatedEmail, validatedPassword)

      // Cookie configuration based on environment
      const isProduction = process.env.NODE_ENV === 'production'
      
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: isProduction, // Only secure in production (requires HTTPS)
        sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure=true
        path: '/',
        maxAge: 24 * 60 * 60, // 24 hours in seconds
      })

      return Response.success(reply, { message: 'Login successful' }, 'Login successful')
    } catch (error) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Login failed',
        'Error while logging in'
      )
    }
  }

  async logOut(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id

    try {
      await this.userService.logOutUser(userId)

      reply.clearCookie('token', {
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      })

      return Response.success(reply, { message: 'LogOut successful' }, 'LogOut successful')
    } catch (error) {
      return Response.error(
        reply,
        'LOGOUT_ERROR',
        'Failed to logout',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAllUsers()
      const userDTOs = UserMapper.toPublicDTOArray(users ?? [])

      if (userDTOs.length === 0) {
        return Response.success(reply, [], 'No users found')
      }

      return Response.success(reply, userDTOs, 'Users fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching the users',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async verifyEmail(req: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    const { token } = req.params

    try {
      const validatedToken = Validator.string(token, 1, 500)

      await this.userService.handleEmailVerification(validatedToken)
      return Response.success(reply, { message: 'User verified successfully' }, 'User verified successfully')
    } catch (error) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Verification failed',
        'Error while verifying email'
      )
    }
  }

  async resendVerifyEmail(req: FastifyRequest, reply: FastifyReply) {
    const { email } = req.body as { email: string }

    try {
      const validatedEmail = Validator.email(email)

      await this.userService.handleResendEmailVerification(validatedEmail)

      return Response.success(
        reply,
        { message: 'Verification email resent successfully' },
        'Verification email resent successfully'
      )
    } catch (error) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Verification failed',
        'Error while resending verification email'
      )
    }
  }

  async requestPasswordReset(req: FastifyRequest, reply: FastifyReply) {
    const { email } = req.body as { email: string }

    try {
      const validatedEmail = Validator.email(email)

      await this.userService.handleRequestPasswordReset(validatedEmail)
      return Response.success(
        reply,
        { message: 'Reset password email sent successfully' },
        'Reset password email sent successfully'
      )
    } catch (error) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Reset password failed',
        'Error while requesting password reset'
      )
    }
  }

  async findOneByResetPasswordToken(req: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    const { token } = req.params as { token: string }

    try {
      const validatedToken = Validator.string(token, 1, 500)

      const user = await this.userService.findOneByResetPasswordToken(validatedToken)
      
      if (!user) {
        return Response.notFound(reply, 'User with reset token', token)
      }
      
      const userDTO = UserMapper.toPublicDTO(user)

      return Response.success(reply, userDTO, 'User fetched successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'User with reset token', token)
      }
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching user by reset password token',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async resetPassword(req: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    const { token } = req.params as { token: string }
    const { password } = req.body as { password: string }

    try {
      const validatedToken = Validator.string(token, 1, 500)
      const validatedPassword = Validator.string(password, 8, 100)

      await this.userService.handleResetPassword(validatedToken, validatedPassword)
      return Response.success(
        reply,
        { message: 'Password has been reset successfully' },
        'Password has been reset successfully'
      )
    } catch (error) {
      return Response.validation(
        reply,
        error instanceof Error ? error.message : 'Failed to reset password',
        'Error while resetting password'
      )
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<User> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      const validatedData = {
        ...data,
        ...(data.email && { email: Validator.email(data.email) }),
      }

      const updated = await this.userService.updateUser(validId, validatedData)
      const updatedDTO = UserMapper.toPublicDTO(updated)

      return Response.success(reply, updatedDTO, 'User updated successfully')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'User', id)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating the user',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    try {
      const validId = Validator.uuid(id)
      await this.userService.deleteUser(validId)
      return Response.noContent(reply)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return Response.notFound(reply, 'User', id)
      }
      return Response.error(
        reply,
        'DELETE_ERROR',
        'Error while deleting the user',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
