import { FastifyReply, FastifyRequest } from 'fastify'
import { UserService } from '../services/user.service'
import { RoleType, User } from '@prisma/client'

export class UserController {
  private userService: UserService

  constructor({ userService }: { userService: UserService }) {
    this.userService = userService
  }

  async register(req: FastifyRequest, reply: FastifyReply) {
    const { email, password, role } = req.body as { email: string; password: string; role?: 'admin' | 'user' }
    try {
      await this.userService.registerUser({ email, password, role: role as RoleType })

      return reply.status(200).send({ message: 'User registered successfully.' })
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while registering new user.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async logIn(req: FastifyRequest, reply: FastifyReply) {
    const { email, password } = req.body as { email: string, password: string };
    const serverUserService = req.server.container.resolve<UserService>('userService')

    try {
      const token = await serverUserService.loginUser(email, password);
      reply.setCookie('token', token, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/',
        domain: '', // Dominio del backend
        maxAge: 24 * 60 * 60
      })

      return reply.status(200).send({ message: "Login successful"})
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while login',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async logOut(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id

    try {
      await this.userService.logOutUser(userId)

      reply.clearCookie('token', {
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
      })
      
      return reply.status(200).send({ message: "LogOut successful" })
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to logout' })
    }
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAllUsers()

      return reply.status(200).send(users)
    } catch (error) {
      return reply.status(400).send({
        message: 'Error while fetching users.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async verifyEmail(req: FastifyRequest<{ Params: { token: string} }>, reply: FastifyReply) {
    const { token } = req.params
    try {
      await this.userService.handleEmailVerification(token)
      return reply.status(200).send({ message: "User verified successfully."})
    } catch (error) {
      return reply.status(400).send({ 
        message: "Verification failed.",
        error: error instanceof Error ? error.message : error
      })
    }
  }

  async resendVerifyEmail(req: FastifyRequest, reply: FastifyReply) {
    const { email } = req.body as { email: string };

    try {
      await this.userService.handleResendEmailVerification(email);

      return reply.status(200).send({ message: 'Verification email resent successfully' })
    } catch (error) {
      return reply.status(400).send({ 
        message: "Verification failed.",
        error: error instanceof Error ? error.message : error
      })
    }
  }

  async requestPasswordReset(req: FastifyRequest, reply: FastifyReply) {
    const { email } = req.body as { email: string };

    try {
      await this.userService.handleRequestPasswordReset(email)
      return reply.status(200).send({ message: 'Reset password email sent successfully.'})
    } catch (error) {
      return reply.status(400).send({
        message: 'Reset password failed',
        error: error instanceof Error ? error.message : error
      })
    }
  }

  async resetPassword(req: FastifyRequest<{ Params: { token: string} }>, reply: FastifyReply) {
    const { token } = req.params as { token: string }
    const { password } = req.body as { password: string }

    try {
      await this.userService.handleResetPassword(token, password);
      return reply.status(200).send({ message: 'Password has been reset successfully.'})
    } catch (error) {
      return reply.status(400).send({
        message: 'Failed to reset password',
        error: error instanceof Error ? error.message : error
      })
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<User> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params
    try {
      await this.userService.updateUser(id, data)

      return reply.status(200).send({ message: 'User updated successfully.' })
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return reply.status(404).send({
          message: error.message,
        })
      }
      return reply.status(400).send({
        message: 'Error while updating the user.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    try {
      await this.userService.deleteUser(id)

      return reply.status(200).send({ message: 'User deleted successfully.' })
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return reply.status(404).send({
          message: error.message,
        })
      }
      return reply.status(400).send({
        message: 'Error while deleting the user.',
        error: error instanceof Error ? error.message : error,
      })
    }
  }
}
