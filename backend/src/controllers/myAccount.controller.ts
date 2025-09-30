import { FastifyReply, FastifyRequest } from 'fastify'
import { MyAccountService } from 'services/myAccount.service'

export class myAccountController {
  private myAccountService: MyAccountService

  constructor({ myAccountService }: { myAccountService: MyAccountService }) {
    this.myAccountService = myAccountService
  }

  async getUserData(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id

    try {
      const userData = await this.myAccountService.getUserData(userId)
      return reply.status(200).send(userData)
    } catch (error) {
      return reply.status(500).send({ message: 'Error al obtener los datos del usuario' })
    }
  }
}
