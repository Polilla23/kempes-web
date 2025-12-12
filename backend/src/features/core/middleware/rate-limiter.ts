import { FastifyRequest } from "fastify";

export interface RateLimitConfig {
	maxAttempts: number;
	timeWindow: string;
	banDuration?: string;
	keyGenerator?: (req: FastifyRequest) => string;
}

export const authRoutePatterns = {
	login: /\/user\/login$/,
	register: /\/user\/register$/,
	resetPassword: /\/user\/(request-)?reset-password/,
	verifyEmail: /\/user\/(verify-email|resend-verification-email)/,
} as const;

// Configuraciones de rate limiting por tipo de ruta
export const rateLimitConfigs = {
	global: {
		maxAttempts: 200, // 200 requests
		timeWindow: "15 minutes",
		keyGenerator: (req: FastifyRequest) => `global:${req.ip}`,
	},

	login: {
		maxAttempts: 5,
		timeWindow: "15 minutes",
		banDuration: "30 minutes",
		keyGenerator: (req: FastifyRequest) => {
			const body = req.body as { email?: string };
			const ip = req.ip;
			const email = body?.email || "unknown";
			return `login:${ip}:${email}`;
		},
	},

	register: {
		maxAttempts: 10,
		timeWindow: "1 hour",
		keyGenerator: (req: FastifyRequest) => {
			return `register:${req.ip}`;
		},
	},

	resetPassword: {
		maxAttempts: 3,
		timeWindow: "1 hour",
		keyGenerator: (req: FastifyRequest) => {
			const body = req.body as { email?: string };
			const email = body?.email || "unknown";
			return `reset:${req.ip}:${email}`;
		},
	},

	verifyEmail: {
		maxAttempts: 10,
		timeWindow: "1 hour",
		keyGenerator: (req: FastifyRequest) => {
			return `verify:${req.ip}`;
		},
	},
} as const;

export function detectRouteType(
	request: FastifyRequest
): keyof typeof rateLimitConfigs {
	const url = request.url;
	const method = request.method;

	// Solo aplicar rate limits especiales a POST requests (excepto verify-email que es GET)
	if (method === "POST" || (method === "GET" && url.includes("verify-email"))) {
		for (const [type, pattern] of Object.entries(authRoutePatterns)) {
			if (pattern.test(url)) {
				return type as keyof typeof rateLimitConfigs;
			}
		}
	}

	return "global";
}

export function createDynamicRateLimitConfig() {
	return {
		keyGenerator: (request: FastifyRequest) => {
			const routeType = detectRouteType(request);
			const config = rateLimitConfigs[routeType];
			return config.keyGenerator
				? config.keyGenerator(request)
				: `${routeType}:${request.ip}`;
		},

		max: async (request: FastifyRequest) => {
			const routeType = detectRouteType(request);
			return rateLimitConfigs[routeType].maxAttempts;
		},

		timeWindow: async (request: FastifyRequest) => {
			const routeType = detectRouteType(request);
			const config = rateLimitConfigs[routeType];
			// Convertir string a milisegundos para compatibilidad con @fastify/rate-limit
			return config.timeWindow === "1 hour" ? 60 * 60 * 1000 : 15 * 60 * 1000;
		},

		errorResponseBuilder: (request: FastifyRequest, context: any) => {
			const routeType = detectRouteType(request);
			const remainingTime = Math.ceil(context.ttl / 1000 / 60); // en minutos

			const messages = {
				login: "login",
				register: "registro",
				resetPassword: "recuperación de contraseña",
				verifyEmail: "verificación de email",
				global: "solicitudes",
			};

			// Log actividad sospechosa para rutas de auth
			if (routeType !== "global") {
				logSuspiciousActivity(request, routeType);
			}

			return {
				code: 429,
				error: "Too Many Requests",
				message: `Demasiados intentos de ${messages[routeType]}. Intenta nuevamente en ${remainingTime} minutos.`,
				retryAfter: context.ttl,
				type: `rate_limit_${routeType}`,
				routeType,
			};
		},

		// Headers informativos
		addHeaders: {
			"x-ratelimit-limit": true,
			"x-ratelimit-remaining": true,
			"x-ratelimit-reset": true,
		},
	};
}

// Logueo para analisis
export function logSuspiciousActivity(request: FastifyRequest, type: string) {
	const ip = request.ip;
	const userAgent = request.headers["user-agent"];
	const body = request.body as any;

	request.log.warn(
		{
			type: "suspicious_auth_activity",
			authType: type,
			ip,
			userAgent,
			email: body?.email || "unknown",
			timestamp: new Date().toISOString(),
		},
		`Rate limit exceeded for ${type} from ${ip}`
	);
}
