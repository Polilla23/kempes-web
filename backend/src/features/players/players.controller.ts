import { FastifyReply, FastifyRequest } from "fastify";
import { PlayerService } from "@/features/players/players.service";
import { Player } from "@prisma/client";
import {
	validateUUID,
	validateString,
	validateNumber,
	validateDate,
} from "@/features/utils/validation";

export class PlayerController {
	private playerService: PlayerService;

	constructor({ playerService }: { playerService: PlayerService }) {
		this.playerService = playerService;
	}

	async create(req: FastifyRequest, reply: FastifyReply) {
		const body = req.body as any;

		try {
			const validatedData = {
				...body,
				...(body.name && { name: validateString(body.name, 1, 100) }),
				...(body.birthDate && { birthDate: validateDate(body.birthDate) }),
				...(body.userId && { userId: validateUUID(body.userId) }),
			};

			const newPlayer = await this.playerService.createPlayer(validatedData);

			return reply.status(201).send({ data: newPlayer });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while creating new player.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async findAll(req: FastifyRequest, reply: FastifyReply) {
		try {
			const players = await this.playerService.findAllPlayers();

			return reply.status(200).send({ data: players });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while fetching players.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async update(
		req: FastifyRequest<{ Params: { id: string }; Body: Partial<Player> }>,
		reply: FastifyReply
	) {
		const data = req.body;
		const { id } = req.params;

		try {
			const validatedId = validateUUID(id);

			const validatedData = {
				...data,
				...(data.name && { name: validateString(data.name, 1, 100) }),
				...(data.birthdate && { birthDate: validateDate(data.birthdate as any) }),
			};

			const updated = await this.playerService.updatePlayer(
				validatedId,
				validatedData
			);

			return reply.status(200).send({ data: updated });
		} catch (error) {
			if (error instanceof Error && error.message === "Player not found") {
				return reply.status(404).send({
					message: error.message,
				});
			}
			return reply.status(400).send({
				message: "Error while updating the player.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async delete(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply
	) {
		const { id } = req.params;

		try {
			const validatedId = validateUUID(id);

			await this.playerService.deletePlayer(validatedId);

			return reply.status(204).send();
		} catch (error) {
			if (error instanceof Error && error.message === "Player not found") {
				return reply.status(404).send({
					message: error.message,
				});
			}
			return reply.status(400).send({
				message: "Error while deleting the player.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async findOne(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply
	) {
		const { id } = req.params;

		try {
			const validatedId = validateUUID(id);

			const player = await this.playerService.findPlayerById(validatedId);

			return reply.status(200).send({ data: player });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while fetching player.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async uploadCSVFile(req: FastifyRequest, reply: FastifyReply) {
		const data = await (req as any).file();
		if (!data) {
			return reply.status(400).send({ message: "No file uploaded." });
		}
		const csvContent = await data.toBuffer();
		try {
			const result = await this.playerService.processCSVFile(
				csvContent.toString("utf-8")
			);

			if (result.success) {
				return reply.status(200).send({
					data: {
						message: result.message || "Players processed and saved successfully.",
					},
				});
			} else {
				return reply.status(400).send({
					message: "Error while processing players.",
					errors: result.errors,
					error: result.message || "Unknown error",
				});
			}
		} catch (error) {
			return reply.status(400).send({
				message: "Error while processing players.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}
}
