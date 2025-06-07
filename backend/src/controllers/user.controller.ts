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
