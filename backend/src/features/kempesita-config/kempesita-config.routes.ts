import { FastifyInstance } from 'fastify'
import { kempesitaConfigSchemas } from '@/features/kempesita-config/kempesita-config.schema'

export const kempesitaConfigRoutes = async (fastify: FastifyInstance) => {
  const kempesitaConfigController = (fastify as any).container.resolve('kempesitaConfigController')

  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: kempesitaConfigSchemas.getActive,
    handler: kempesitaConfigController.getActive.bind(kempesitaConfigController),
  })

  fastify.put('/', {
    preHandler: [fastify.authenticate],
    schema: kempesitaConfigSchemas.upsert,
    handler: kempesitaConfigController.upsert.bind(kempesitaConfigController),
  })
}
