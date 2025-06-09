import Fastify from 'fastify'
import dotenv from 'dotenv'
import { createDepencyContainer } from './container'
import { routes } from './routes/index.routes'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env')});

const app = Fastify({
  logger: false,
})

app.register(swagger, {
  swagger: {
    info: {
      title: 'API Documentation',
      description: 'API documentation for Kempes web application.',
      version: '1.0.0',
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Bearer token authentication',
      },
    },
    security: [
      {
        Bearer: [],
      },
    ],
  },
})

app.register(swaggerUi, {
  routePrefix: '/apidocs',
})

app.register(async function (fastify) {
  const container = createDepencyContainer(app)
  app.decorate('container', container)
})

app.register(routes)

export default app
