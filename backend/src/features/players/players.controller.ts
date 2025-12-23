import { Player } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { PlayerService } from '@/features/players/players.service'
import { PlayerMapper, Response, ValidationError } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { PlayerDTO, CreateBasicPlayerInput } from '@/types'

export class PlayerController {
  private playerService: PlayerService

  constructor({ playerService }: { playerService: PlayerService }) {
    this.playerService = playerService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const { name, lastName, birthdate, actualClubId, overall, salary, sofifaId, transfermarktId } =
      req.body as CreateBasicPlayerInput

    // Validación - si falla, lanza error y el errorHandler lo maneja
    const validatedData: CreateBasicPlayerInput = {
      name: Validator.string(name, 1, 100),
      lastName: Validator.string(lastName, 1, 100),
      birthdate: new Date(birthdate),
      ...(actualClubId && { actualClubId: Validator.uuid(actualClubId) }),
      ...(overall !== undefined && { overall: Validator.number(overall, 0, 100) }),
      ...(salary !== undefined && { salary: Validator.number(salary, 0) }),
      ...(sofifaId && { sofifaId: Validator.string(sofifaId, 1, 50) }),
      ...(transfermarktId && { transfermarktId: Validator.string(transfermarktId, 1, 50) }),
    }

    const newPlayer = await this.playerService.createPlayer(validatedData)
    const playerDTO = PlayerMapper.toDTO(newPlayer)

    return Response.created(reply, playerDTO, 'Player created successfully')
  }

  async findAll(_req: FastifyRequest, reply: FastifyReply) {
    const players = await this.playerService.findAllPlayers()
    const playerDTOs = PlayerMapper.toDTOArray(players ?? [])

    if (playerDTOs.length === 0) {
      return Response.success(reply, [], 'No players found')
    }

    return Response.success(reply, playerDTOs, 'Players fetched successfully')
  }

  async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Player> }>, reply: FastifyReply) {
    const data = req.body
    const { id } = req.params

    // Validaciones - si fallan, errorHandler maneja automáticamente
    const validId = Validator.uuid(id)
    const validatedData = {
      ...data,
      ...(data.name && { name: Validator.string(data.name, 1, 100) }),
      ...(data.lastName && { lastName: Validator.string(data.lastName, 1, 100) }),
      ...(data.birthdate && { birthdate: new Date(data.birthdate as any) }),
      ...(data.actualClubId && { actualClubId: Validator.uuid(data.actualClubId) }),
      ...(data.overall !== undefined && { overall: Validator.number(data.overall, 0, 100) }),
    }

    // Si el player no existe, service lanza PlayerNotFoundError
    // errorHandler lo detecta y llama Response.notFound() automáticamente
    const updated = await this.playerService.updatePlayer(validId, validatedData)
    const updatedDTO = PlayerMapper.toDTO(updated)

    return Response.success(reply, updatedDTO, 'Player updated successfully')
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    const validId = Validator.uuid(id)
    await this.playerService.deletePlayer(validId)

    return Response.noContent(reply)
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    const validId = Validator.uuid(id)
    const player = await this.playerService.findPlayerById(validId)
    const playerDTO = PlayerMapper.toDTO(player)

    return Response.success(reply, playerDTO, 'Player fetched successfully')
  }

  async uploadCSVFile(req: FastifyRequest, reply: FastifyReply) {
    const data = await (req as any).file()

    if (!data) {
      throw new ValidationError('File is required', { field: 'file' })
    }

    const csvContent = await data.toBuffer()
    await this.playerService.processCSVFile(csvContent.toString('utf-8'))

    return Response.success(
      reply,
      { message: 'Players processed and saved successfully' },
      'CSV processed successfully'
    )
  }
}
