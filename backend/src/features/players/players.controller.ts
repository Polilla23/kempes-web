import { Player } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { PlayerService } from '@/features/players/players.service'
import { PlayerMapper, Response, ValidationError } from '@/features/core'
import { Validator } from '@/features/utils/validation'
import { CreateBasicPlayerInput } from '@/types'

export class PlayerController {
  private playerService: PlayerService

  constructor({ playerService }: { playerService: PlayerService }) {
    this.playerService = playerService
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    const {
      fullName,
      birthdate,
      actualClubId,
      ownerClubId,
      overall,
      sofifaId,
      transfermarktId,
    } = req.body as CreateBasicPlayerInput

    // Validación - si falla, lanza error y el errorHandler lo maneja
    const validatedData: CreateBasicPlayerInput = {
      fullName: Validator.string(fullName, 1, 100),
      birthdate,
      ...(actualClubId && { actualClubId: Validator.uuid(actualClubId) }),
      ...(ownerClubId && { ownerClubId: Validator.uuid(ownerClubId) }),
      ...(overall !== undefined && { overall: Validator.number(overall, 0, 100) }),
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
      ...(data.fullName && { fullName: Validator.string(data.fullName, 1, 100) }),
      ...(data.birthdate && { birthdate: data.birthdate }),
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
    const deleted = await this.playerService.deletePlayer(validId)

    const deletedDTO = PlayerMapper.toDTO(deleted)
    return Response.success(reply, deletedDTO, 'Player deleted successfully')
  }

  async findOne(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params

    const validId = Validator.uuid(id)
    const player = await this.playerService.findPlayerById(validId)
    const playerDTO = PlayerMapper.toDTO(player)

    return Response.success(reply, playerDTO, 'Player fetched successfully')
  }

  async getCareer(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    const validId = Validator.uuid(id)
    const career = await this.playerService.getPlayerCareer(validId)
    return Response.success(reply, career, 'Player career fetched successfully')
  }

  async getSeasonStats(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    const validId = Validator.uuid(id)
    const stats = await this.playerService.getPlayerSeasonStats(validId)
    return Response.success(reply, stats, 'Player season stats fetched successfully')
  }

  async getTitles(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    const validId = Validator.uuid(id)
    const titles = await this.playerService.getPlayerTitles(validId)
    return Response.success(reply, titles, 'Player titles fetched successfully')
  }

  async getTransfers(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = req.params
    const validId = Validator.uuid(id)
    const transfers = await this.playerService.getPlayerTransferHistory(validId)
    return Response.success(reply, transfers, 'Player transfer history fetched successfully')
  }

  async bulkUpdateOveralls(req: FastifyRequest, reply: FastifyReply) {
    const { updates } = req.body as { updates: Array<{ playerId: string; overall: number }> }

    if (!Array.isArray(updates) || updates.length === 0) {
      throw new ValidationError('Updates array is required and must not be empty', { field: 'updates' })
    }

    // Validate each entry
    const validated = updates.map((u) => ({
      playerId: Validator.uuid(u.playerId),
      overall: Validator.number(u.overall, 0, 100),
    }))

    const result = await this.playerService.bulkUpdateOveralls(validated)
    return Response.success(reply, result, 'Player overalls updated successfully')
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
      'CSV processed successfully',
    )
  }
}
