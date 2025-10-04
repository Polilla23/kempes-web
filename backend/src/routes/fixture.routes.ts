import { FastifyInstance } from "fastify";
import { fixtureSchemas } from "schemas/fixture.schema";

export const fixtureRoutes = async (fastify: FastifyInstance) => {
    const fixtureController = (fastify as any).container.resolve("fixtureController");

    fastify.post("/fixtures/knockout", {
        preHandler: [fastify.authenticate],
        schema: fixtureSchemas.createKnockout,
        handler: fixtureController.create.bind(fixtureController),
    });

    fastify.post("/fixtures/group-stage", {
        preHandler: [fastify.authenticate],
        schema: fixtureSchemas.createGroupStage,
        handler: fixtureController.createGroupStageFixture.bind(fixtureController),
    });

    fastify.post("/fixtures/league", {
        preHandler: [fastify.authenticate],
        schema: fixtureSchemas.createLeague,
        handler: fixtureController.createLeagueFixture.bind(fixtureController),
    });

    fastify.post("/fixtures/:matchId/finish", {
        preHandler: [fastify.authenticate],
        schema: fixtureSchemas.finishMatch,
        handler: fixtureController.finishMatch.bind(fixtureController),
    });

    fastify.get("/fixtures/competitions/:competitionId", {
        preHandler: [fastify.authenticate],
        schema: fixtureSchemas.getCompetitionMatches,
        handler: fixtureController.getCompetitionMatches.bind(fixtureController),
    });
    
    fastify.get("/fixtures/competitions/:competitionId/knockout", {
        preHandler: [fastify.authenticate],
        schema: fixtureSchemas.getKnockoutBracket,
        handler: fixtureController.getKnockoutBracket.bind(fixtureController),
    });

    fastify.get("/fixtures/:matchId", {
        preHandler: [fastify.authenticate],
        schema: fixtureSchemas.getMatchById,
        handler: fixtureController.getMatchById.bind(fixtureController),
    });
};