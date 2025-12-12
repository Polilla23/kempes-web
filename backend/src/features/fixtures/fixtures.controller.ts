import { FastifyReply, FastifyRequest } from "fastify";
import { FixtureService } from "@/features/fixtures/fixtures.service";
import {
	KnockoutFixtureInput,
	LeagueFixtureInput,
	GroupStageFixtureInput,
	FinishMatchInput,
} from "@/features/utils/types";
import { validateUUID } from "@/features/utils/validation";

export class FixtureController {
	constructor(private fixtureService: FixtureService) {}

	/**
	 * Create knockout bracket with match dependencies
	 */
	async createKnockoutFixture(
		req: FastifyRequest<{ Body: KnockoutFixtureInput }>,
		reply: FastifyReply
	) {
		try {
			const validatedKnockoutFixtureInput = {
				...req.body,
				competitionId: validateUUID(req.body.competitionId),
			};
			const result = await this.fixtureService.createKnockoutFixture(
				validatedKnockoutFixtureInput
			);
			return reply.status(201).send({ data: result });
		} catch (error) {
			return reply.status(500).send({
				message: "Failed to create knockout fixture",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async createGroupStageFixture(
		req: FastifyRequest<{ Body: GroupStageFixtureInput }>,
		reply: FastifyReply
	) {
		try {
			const validatedGroupStageFixtureInput = {
				...req.body,
				competitionId: validateUUID(req.body.competitionId),
			};
			const result = await this.fixtureService.createGroupStageFixtures(
				validatedGroupStageFixtureInput
			);
			return reply.status(201).send({ data: result });
		} catch (error) {
			return reply.status(500).send({
				message: "Failed to create group stage fixtures",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async createLeagueFixture(
		req: FastifyRequest<{ Body: LeagueFixtureInput }>,
		reply: FastifyReply
	) {
		try {
			const validatedLeagueFixtureInput = {
				...req.body,
				competitionId: validateUUID(req.body.competitionId),
			};
			const result = await this.fixtureService.createLeagueFixture(
				validatedLeagueFixtureInput
			);
			return reply.status(201).send({ data: result });
		} catch (error) {
			return reply.status(500).send({
				message: "Failed to create league fixture",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async finishMatch(
		req: FastifyRequest<{
			Params: { matchId: string };
			Body: Omit<FinishMatchInput, "matchId">;
		}>,
		reply: FastifyReply
	) {
		const { matchId } = req.params;
		try {
			const validatedMatchId = validateUUID(matchId);
			const result = await this.fixtureService.finishMatch({
				matchId: validatedMatchId,
				...req.body,
			});
			return reply.status(200).send({ data: result });
		} catch (error) {
			return reply.status(500).send({
				message: "Failed to finish match",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async getCompetitionMatches(
		req: FastifyRequest<{ Params: { competitionId: string } }>,
		reply: FastifyReply
	) {
		const { competitionId } = req.params;

		try {
			const validatedCompetitionId = validateUUID(competitionId);
			const result = await this.fixtureService.getCompetitionMatches(
				validatedCompetitionId
			);
			return reply.status(200).send({ data: result });
		} catch (error) {
			return reply.status(500).send({
				message: "Failed to retrieve competition matches",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async getKnockoutBracket(
		req: FastifyRequest<{ Params: { competitionId: string } }>,
		reply: FastifyReply
	) {
		const { competitionId } = req.params;

		try {
			const validatedCompetitionId = validateUUID(competitionId);
			const result = await this.fixtureService.getKnockoutBracket(
				validatedCompetitionId
			);
			return reply.status(200).send({ data: result });
		} catch (error) {
			return reply.status(500).send({
				message: "Failed to retrieve knockout bracket",
				error: error instanceof Error ? error.message : error,
			});
		}
	}

	async getMatchById(
		req: FastifyRequest<{ Params: { matchId: string } }>,
		reply: FastifyReply
	) {
		const { matchId } = req.params;

		try {
			const validatedMatchId = validateUUID(matchId);
			const result = await this.fixtureService.getMatchById(validatedMatchId);
			return reply.status(200).send({ data: result });
		} catch (error) {
			return reply.status(500).send({
				message: "Failed to retrieve match",
				error: error instanceof Error ? error.message : error,
			});
		}
	}
}
