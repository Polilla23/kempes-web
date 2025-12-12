import { Club } from "@prisma/client";
import { FastifyRequest, FastifyReply } from "fastify";
import { ClubService } from "@/features/clubs/clubs.service";
import {
	validateUUID,
	validateString,
	validateBoolean,
	validateUrl,
} from "@/features/utils/validation";

export class ClubController {
	private clubService: ClubService;

	constructor({ clubService }: { clubService: ClubService }) {
		this.clubService = clubService;
	}

	async create(req: FastifyRequest, reply: FastifyReply) {
		const { name, logo, userId, isActive } = req.body as {
			name: string;
			logo: string;
			userId?: string | null;
			isActive?: boolean;
		};
		try {
			const validatedData = {
				name: validateString(name, 1, 100),
				logo: validateUrl(logo, { require_protocol: false }),
				...(userId && { userId: validateUUID(userId) }),
				...(isActive !== undefined && { isActive: validateBoolean(isActive) }),
			};
			const newClub = await this.clubService.createClub(validatedData);

			// Return 201 Created with the created resource
			return reply.status(201).send({ data: newClub });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while creating new club.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async findAll(_req: FastifyRequest, reply: FastifyReply) {
		try {
			const clubs = await this.clubService.findAllClubs();

			return reply.status(200).send({ data: clubs });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while fetching the clubs.",
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
			const club = await this.clubService.findClub(validatedId);

			return reply.status(200).send({ data: club });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while fetching the club.",
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
			await this.clubService.deleteClub(validatedId);
			// 204 No Content on successful deletion
			return reply.status(204).send();
		} catch (error) {
			if (error instanceof Error && error.message === "Club not found") {
				return reply.status(404).send({
					message: error.message,
				});
			}
			return reply.status(400).send({
				message: "Error while deleting the club.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}
	async update(
		req: FastifyRequest<{ Params: { id: string }; Body: Partial<Club> }>,
		reply: FastifyReply
	) {
		const data = req.body;
		const { id } = req.params;

		try {
			const validatedId = validateUUID(id);
			const validatedData = {
				...data,
				...(data.name && { name: validateString(data.name, 1, 100) }),
				...(data.logo && {
					logo: validateUrl(data.logo, { require_protocol: false }),
				}),
				...(data.userId && { userId: validateUUID(data.userId) }),
				...(data.isActive !== undefined && {
					isActive: validateBoolean(data.isActive),
				}),
			};
			const updated = await this.clubService.updateClub(
				validatedId,
				validatedData
			);

			return reply.status(200).send({ data: updated });
		} catch (error) {
			if (error instanceof Error && error.message === "Club not found") {
				return reply.status(404).send({
					message: error.message,
				});
			}
			return reply.status(400).send({
				message: "Error while updating the club.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}
}
