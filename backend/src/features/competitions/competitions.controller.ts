import { FastifyRequest, FastifyReply } from "fastify";
import { KempesCupRules, LeaguesRules } from "@/features/utils/types";
import { CompetitionService } from "@/features/competitions/competitions.service";
import { validateUUID } from "@/features/utils/validation";

export class CompetitionController {
	private competitionService: CompetitionService;

	constructor({
		competitionService,
	}: {
		competitionService: CompetitionService;
	}) {
		this.competitionService = competitionService;
	}

	async create(req: FastifyRequest, reply: FastifyReply) {
		const config = req.body as LeaguesRules;
		try {
			const newCompetition = await this.competitionService.createCompetition(
				config
			);
			return reply.status(201).send({ data: newCompetition });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while creating new competition.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async findAll(_req: FastifyRequest, reply: FastifyReply) {
		try {
			const competitions = await this.competitionService.findAllCompetitions();
			return reply.status(200).send({ data: competitions });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while fetching competitions.",
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
			const competition = await this.competitionService.findCompetition(
				validatedId
			);
			return reply.status(200).send({ data: competition });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while fetching competition.",
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
			await this.competitionService.deleteCompetition(validatedId);
			return reply.status(204).send();
		} catch (error) {
			return reply.status(400).send({
				message: "Error while deleting competition.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async update(
		req: FastifyRequest<{
			Params: { id: string };
			Body: Partial<LeaguesRules | KempesCupRules>;
		}>,
		reply: FastifyReply
	) {
		const { id } = req.params;
		const data = req.body;
		try {
			const validatedId = validateUUID(id);
			const updated = await this.competitionService.updateCompetition(
				validatedId,
				data
			);
			return reply.status(200).send({ data: updated });
		} catch (error) {
			return reply.status(400).send({
				message: "Error while updating competition.",
				error: error instanceof Error ? error.message : error,
			});
		}
	}
}
