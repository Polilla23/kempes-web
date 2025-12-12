import { FastifyReply, FastifyRequest } from "fastify";
import { MyAccountService } from "@/features/me/me.service";
import { validateUUID } from "@/features/utils/validation";

export class MyAccountController {
	private myAccountService: MyAccountService;

	constructor({ myAccountService }: { myAccountService: MyAccountService }) {
		this.myAccountService = myAccountService;
	}

	async getUserData(req: FastifyRequest, reply: FastifyReply) {
		const userId = (req.user as { id: string }).id;

		try {
			const validatedUserId = validateUUID(userId);
			const userData = await this.myAccountService.getUserData(validatedUserId);
			return reply.status(200).send({ data: userData });
		} catch (error) {
			return reply.status(500).send({ message: "Error while fetching user data" });
		}
	}
}
