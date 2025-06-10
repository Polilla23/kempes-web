import { FastifyReply, FastifyRequest } from "fastify";

type Role = 'ADMIN' | 'USER';

export function authorize(allowedRoles: Role[]) {
    return async(req: FastifyRequest, reply: FastifyReply) => {
        const user = req.user as { id: string, role: Role }
        if(!user || !allowedRoles.includes(user.role)) {
            reply.status(403).send({ error: 'Forbidden'})
        }
    }
}