import { FastifyRequest, FastifyReply } from 'fastify'
import { MyAccountService } from '@/features/me/me.service'
import { UserMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class MyAccountController {
  private myAccountService: MyAccountService

  constructor({ myAccountService }: { myAccountService: MyAccountService }) {
    this.myAccountService = myAccountService
  }

  async getUserData(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id

    try {
      const validatedUserId = Validator.uuid(userId)
      const userData = await this.myAccountService.getUserData(validatedUserId)

      if (!userData) {
        return Response.notFound(reply, 'User data', userId)
      }

      const userDTO = UserMapper.toProfileDTO(userData)
      return Response.success(reply, userDTO, 'User data fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching user data',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
