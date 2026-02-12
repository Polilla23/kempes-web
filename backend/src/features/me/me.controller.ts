import { FastifyRequest, FastifyReply } from 'fastify'
import { MyAccountService } from '@/features/me/me.service'
import { UserMapper, Response } from '@/features/core'
import { Validator } from '@/features/utils/validation'

export class MyAccountController {
  private myAccountService: MyAccountService

  constructor({ myAccountService }: { myAccountService: MyAccountService }) {
    this.myAccountService = myAccountService
  }

  async getUserFullProfile(userId: string) {
    const validatedUserId = Validator.uuid(userId)
    const userData = await this.myAccountService.getUserData(validatedUserId)
    return {
      id: userData.id,
      role: userData.role,
      email: userData.email,
      username: userData.username ?? null,
      avatar: userData.avatar ?? null,
    }
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

  async getUserClub(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id

    try {
      const validatedUserId = Validator.uuid(userId)
      const club = await this.myAccountService.getUserClub(validatedUserId)

      return Response.success(reply, club, 'Club data fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching club data',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getUserLeague(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id

    try {
      const validatedUserId = Validator.uuid(userId)
      const league = await this.myAccountService.getUserLeague(validatedUserId)

      return Response.success(reply, league, 'League data fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching league data',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getUserRecentMatches(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id
    const { limit } = req.query as { limit?: string }

    try {
      const validatedUserId = Validator.uuid(userId)
      const matches = await this.myAccountService.getUserRecentMatches(
        validatedUserId,
        limit ? parseInt(limit, 10) : 10
      )

      return Response.success(reply, matches, 'Recent matches fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching recent matches',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getUserUpcomingMatches(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id
    const { limit } = req.query as { limit?: string }

    try {
      const validatedUserId = Validator.uuid(userId)
      const matches = await this.myAccountService.getUserUpcomingMatches(
        validatedUserId,
        limit ? parseInt(limit, 10) : 5
      )

      return Response.success(reply, matches, 'Upcoming matches fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching upcoming matches',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getRecentMatches(req: FastifyRequest, reply: FastifyReply) {
    const { limit } = req.query as { limit?: string }

    try {
      const matches = await this.myAccountService.getRecentMatches(limit ? parseInt(limit, 10) : 20)

      return Response.success(reply, matches, 'Recent matches fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching recent matches',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async getSeasonStats(req: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.myAccountService.getSeasonStats()

      return Response.success(reply, stats, 'Season stats fetched successfully')
    } catch (error) {
      return Response.error(
        reply,
        'FETCH_ERROR',
        'Error while fetching season stats',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }

  async updateProfile(req: FastifyRequest, reply: FastifyReply) {
    const userId = (req.user as { id: string }).id

    try {
      const validatedUserId = Validator.uuid(userId)

      let username: string | undefined
      let avatarFile: { buffer: Buffer; filename: string; mimetype: string } | undefined

      if (req.isMultipart()) {
        const data = await req.file()
        if (data) {
          avatarFile = {
            buffer: await data.toBuffer(),
            filename: data.filename,
            mimetype: data.mimetype,
          }
          const usernameField = data.fields.username as { value: string } | undefined
          username = usernameField?.value
        }
      } else {
        const body = req.body as { username?: string }
        username = body.username
      }

      const updatedUser = await this.myAccountService.updateProfile(validatedUserId, {
        username,
        avatarFile,
      })

      const userDTO = UserMapper.toProfileDTO(updatedUser)
      return Response.success(reply, userDTO, 'Profile updated successfully')
    } catch (error: any) {
      if (error.name === 'UsernameAlreadyTakenError') {
        return Response.badRequest(reply, error.message)
      }
      if (error.name === 'InvalidFileTypeError' || error.name === 'FileSizeExceededError') {
        return Response.badRequest(reply, error.message)
      }
      return Response.error(
        reply,
        'UPDATE_ERROR',
        'Error while updating profile',
        500,
        error instanceof Error ? error.message : error
      )
    }
  }
}
