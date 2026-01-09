import { FastifyInstance } from 'fastify'
import { salaryRatesSchemas } from '@/features/salary-rates/salary-rates.schema'

export const salaryRateRoutes = async (fastify: FastifyInstance) => {
  const salaryRateController = (fastify as any).container.resolve('salaryRateController')
  
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: salaryRatesSchemas.create,
    handler: salaryRateController.create.bind(salaryRateController),
  })
  
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: salaryRatesSchemas.findAll,
    handler: salaryRateController.findAll.bind(salaryRateController),
  })
  
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: salaryRatesSchemas.findOne,
    handler: salaryRateController.findOne.bind(salaryRateController),
  })
  
  fastify.patch('/:id', {
    preHandler: [fastify.authenticate],
    schema: salaryRatesSchemas.update,
    handler: salaryRateController.update.bind(salaryRateController),
  })
  
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: salaryRatesSchemas.delete,
    handler: salaryRateController.delete.bind(salaryRateController),
  })
}
