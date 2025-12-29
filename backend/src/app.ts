import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
import { createDepencyContainer } from "@/features/core/container";
import { env } from "@/features/core/config/env";
import { errorHandler } from "@/features/core/middleware/errorHandler";
import { routes } from "@/features/api/routes";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie, { FastifyCookieOptions } from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import path from "path";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = Fastify({
	logger: false,
});

// Registro de Swagger
app.register(swagger, {
	openapi: {
		info: {
			title: "Kempes Web API",
			description: "API documentation for Kempes web application.",
			version: "1.0.0",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				Bearer: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
});

// Swagger UI
app.register(swaggerUi, {
	routePrefix: "/apidocs",
});

// FastifyCookie para manejar las cookies
app.register(fastifyCookie, {
	secret: env.FASTIFY_COOKIE_SECRET, // Variable validada y tipada
	hook: "preHandler",
	parseOptions: {
		httpOnly: false, // La cookie no es accesible mediante JavaScript
		secure: false, // Solo en HTTPS si está en producción
		sameSite: "lax", // Puede ser 'strict' o 'lax', según la necesidad
		path: "/", // Ruta válida para la cookie
	},
} as FastifyCookieOptions);

// FastifyJwt para manejar token -> cookie
app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
	cookie: {
		cookieName: "token",
		signed: false,
	},
});

// CORS
app.register(fastifyCors, {
	origin:
		env.FRONT_URL && env.BACK_URL
			? [env.FRONT_URL, env.BACK_URL]
			: ["http://localhost:5173", "http://localhost:3000"],
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
	allowedHeaders: ["Content-Type", "Authorization"],
});

// FastifyMultipart para manejo de archivos
app.register(fastifyMultipart);

// Rate Limiter
app.register(async function (fastify) {
	const { createDynamicRateLimitConfig } = await import(
		"@/features/core/middleware/rate-limiter"
	);

	await fastify.register(rateLimit, {
		global: true,
		skipOnError: true,
		...createDynamicRateLimitConfig(),
	});
});

//Helmet
app.register(helmet, {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'"],
			imgSrc: ["'self'", "data:", "https:"],
		},
	},
	hsts: {
		maxAge: 31536000, // 1 año
		includeSubDomains: true,
		preload: true,
	},
});

app.decorate(
	"authenticate",
	async function (req: FastifyRequest, reply: FastifyReply) {
		try {
			const token = req.cookies.token;
			if (!token) {
				return reply.status(401).send({ message: "Authentication required" });
			}

			const decoded = await req.jwtVerify<{ id: string; role: string }>();

			if (!decoded.role || !decoded.id) {
				throw new Error("Invalid token structure");
			}

			req.user = { id: decoded.id, role: decoded.role };
		} catch (error) {
			return reply.status(401).send({ message: "Invalid token" });
		}
	}
);

// Registro de container
app.register(async function (fastify) {
	const container = createDepencyContainer(app);
	app.decorate("container", container);
});

// Registro de rutas
app.register(routes);

// ⚡ Error Handler Unificado (debe ir AL FINAL)
app.setErrorHandler(errorHandler);

export default app;
