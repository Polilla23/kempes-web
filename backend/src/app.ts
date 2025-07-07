import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import dotenv from 'dotenv'
import { createDepencyContainer } from './container'
import { routes } from './routes/index.routes'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = Fastify({
  logger: false,
})

// Registro de Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'Kempes Web API',
      description: 'API documentation for Kempes web application.',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        Bearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
})

// Registro de Swagger UI
app.register(swaggerUi, {
  routePrefix: '/apidocs',
})

// Registro de fastifyCookie para manejar las cookies
app.register(fastifyCookie, {
  secret: process.env.FASTIFY_COOKIE_SECRET || 'blaabla', // La clave de firma para las cookies
  hook: 'preHandler',
  parseOptions: {
    httpOnly: false, // La cookie no es accesible mediante JavaScript
    secure: false, // Solo en HTTPS si está en producción
    sameSite: 'lax', // Puede ser 'strict' o 'lax', según la necesidad
    path: '/', // Ruta válida para la cookie
  },
} as FastifyCookieOptions)

// Registro de fastifyJwt para manejar token -> cookie
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'queondaperro',
  cookie: {
    cookieName: 'token',
    signed: false,
  },
})

app.register(fastifyCors, {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

app.decorate('authenticate', async function (req: FastifyRequest, reply: FastifyReply) {
  try {
    const token = req.cookies.token
    if (!token) {
      return reply.status(401).send({ message: 'Authentication required' })
    }

    const decoded = await req.jwtVerify<{ id: string; role: string }>()
    
    if (!decoded.role || !decoded.id) {
      throw new Error('Invalid token structure')
    }

    req.user = { id: decoded.id, role: decoded.role }
  } catch (error) {
    return reply.status(401).send({ message: 'Invalid token' })
  }
})

// Registro de container
app.register(async function (fastify) {
  const container = createDepencyContainer(app)
  app.decorate('container', container)
})

// Registro de rutas
app.register(routes)

export default app
