import fastify, { FastifyRegisterOptions, FastifyReply, FastifyRequest } from 'fastify'
import { UserService } from '../services/user.service'

export class UserController {
  private userService: UserService

  constructor({ userService }: { userService: UserService }) {
    this.userService = userService
  }

  async register(req: FastifyRequest, reply: FastifyReply) {
    const { email, password, role } = req.body as { email: string; password: string; role?: 'admin' | 'user' }
    try {
      await this.userService.registerUser({ email, password, role })
      return reply.status(200).send({ message: 'User registered successfully.' })
    } catch (error) {
      return reply.status(400).send({ message: 'Error while registering new user.' })
    }
  }
}
