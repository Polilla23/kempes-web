import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "@/features/users/users.service";
import { RoleType, User } from "@prisma/client";
import {
	validateEmail,
	validateString,
	sanitizeEmail,
	validateUUID,
} from "@/features/utils/validation";

export class UserController {
	private userService: UserService;

	constructor({ userService }: { userService: UserService }) {
		this.userService = userService;
	}

	async register(req: FastifyRequest, reply: FastifyReply) {
		const { email, password, role } = req.body as {
			email: string;
			password: string;
			role?: "admin" | "user";
		};

		try {
			const validatedEmail = validateEmail(email);
			const validatedPassword = validateString(password, 8, 100);
			const sanitizedEmail = sanitizeEmail(validatedEmail);

			await this.userService.registerUser({
				email: sanitizedEmail,
				password: validatedPassword,
				role: role as RoleType,
			});

			return reply.status(201).send({ message: "User registered successfully." });
		} catch (error) {
			const statusCode =
				error instanceof Error && error.message.includes("Invalid") ? 400 : 400;
			return reply.status(statusCode).send({
				message:
					error instanceof Error
						? error.message
						: "Error while registering new user.",
			});
		}
	}

	async logIn(req: FastifyRequest, reply: FastifyReply) {
		const { email, password } = req.body as { email: string; password: string };

		try {
			const validatedEmail = validateEmail(email);
			const validatedPassword = validateString(password, 1, 100);
			const sanitizedEmail = sanitizeEmail(validatedEmail);

			const token = await this.userService.loginUser(
				sanitizedEmail,
				validatedPassword
			);

			reply.setCookie("token", token, {
				httpOnly: false,
				secure: true,
				sameSite: "none",
				path: "/",
				domain: "", // Dominio del backend
				maxAge: 24 * 60 * 60,
			});

			return reply.status(200).send({ message: "Login successful" });
		} catch (error) {
			return reply.status(400).send({
				message: error instanceof Error ? error.message : "Error while login",
			});
		}
	}

	async logOut(req: FastifyRequest, reply: FastifyReply) {
		const userId = (req.user as { id: string }).id;

		try {
			await this.userService.logOutUser(userId);

			reply.clearCookie("token", {
				path: "/",
				httpOnly: false,
				secure: false,
				sameSite: "lax",
			});

			return reply.status(200).send({ message: "LogOut successful" });
		} catch (error) {
			return reply.status(500).send({
				message: error instanceof Error ? error.message : "Failed to logout",
			});
		}
	}

	async findAll(_req: FastifyRequest, reply: FastifyReply) {
		try {
			const users = await this.userService.findAllUsers();
			return reply.status(200).send({ data: users });
		} catch (error) {
			return reply.status(400).send({
				message:
					error instanceof Error ? error.message : "Error while fetching users.",
			});
		}
	}

	async verifyEmail(
		req: FastifyRequest<{ Params: { token: string } }>,
		reply: FastifyReply
	) {
		const { token } = req.params;

		try {
			const validatedToken = validateString(token, 1, 500);

			await this.userService.handleEmailVerification(validatedToken);
			return reply.status(200).send({ message: "User verified successfully." });
		} catch (error) {
			return reply.status(400).send({
				message: error instanceof Error ? error.message : "Verification failed.",
			});
		}
	}

	async resendVerifyEmail(req: FastifyRequest, reply: FastifyReply) {
		const { email } = req.body as { email: string };

		try {
			const validatedEmail = validateEmail(email);
			const sanitizedEmail = sanitizeEmail(validatedEmail);

			await this.userService.handleResendEmailVerification(sanitizedEmail);

			return reply
				.status(200)
				.send({ message: "Verification email resent successfully" });
		} catch (error) {
			return reply.status(400).send({
				message: error instanceof Error ? error.message : "Verification failed.",
			});
		}
	}

	async requestPasswordReset(req: FastifyRequest, reply: FastifyReply) {
		const { email } = req.body as { email: string };

		try {
			// Validación y sanitización del email
			const validatedEmail = validateEmail(email);
			const sanitizedEmail = sanitizeEmail(validatedEmail);

			await this.userService.handleRequestPasswordReset(sanitizedEmail);
			return reply
				.status(200)
				.send({ message: "Reset password email sent successfully." });
		} catch (error) {
			return reply.status(400).send({
				message: error instanceof Error ? error.message : "Reset password failed",
			});
		}
	}

	async findOneByResetPasswordToken(
		req: FastifyRequest<{ Params: { token: string } }>,
		reply: FastifyReply
	) {
		const { token } = req.params as { token: string };

		try {
			const validatedToken = validateString(token, 1, 500);

			const user = await this.userService.findOneByResetPasswordToken(
				validatedToken
			);
			return reply.status(200).send({ data: user });
		} catch (error) {
			return reply.status(400).send({
				message:
					error instanceof Error
						? error.message
						: "Error while fetching user by reset password token.",
			});
		}
	}

	async resetPassword(
		req: FastifyRequest<{ Params: { token: string } }>,
		reply: FastifyReply
	) {
		const { token } = req.params as { token: string };
		const { password } = req.body as { password: string };

		try {
			const validatedToken = validateString(token, 1, 500);
			const validatedPassword = validateString(password, 8, 100);

			await this.userService.handleResetPassword(
				validatedToken,
				validatedPassword
			);
			return reply
				.status(200)
				.send({ message: "Password has been reset successfully." });
		} catch (error) {
			return reply.status(400).send({
				message:
					error instanceof Error ? error.message : "Failed to reset password",
			});
		}
	}

	async update(
		req: FastifyRequest<{ Params: { id: string }; Body: Partial<User> }>,
		reply: FastifyReply
	) {
		const data = req.body;
		const { id } = req.params;

		try {
			const validatedId = validateUUID(id);

			if (data.email) {
				data.email = sanitizeEmail(validateEmail(data.email));
			}

			const updated = await this.userService.updateUser(validatedId, data);

			return reply.status(200).send({ data: updated });
		} catch (error) {
			if (error instanceof Error && error.message === "User not found") {
				return reply.status(404).send({
					message: error.message,
				});
			}
			return reply.status(400).send({
				message:
					error instanceof Error ? error.message : "Error while updating the user.",
			});
		}
	}

	async delete(
		req: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply
	) {
		const { id } = req.params;

		try {
			// Validar que el ID sea un UUID válido
			const validatedId = validateUUID(id);

			await this.userService.deleteUser(validatedId);

			return reply.status(204).send();
		} catch (error) {
			if (error instanceof Error && error.message === "User not found") {
				return reply.status(404).send({
					message: error.message,
				});
			}
			return reply.status(400).send({
				message:
					error instanceof Error ? error.message : "Error while deleting the user.",
			});
		}
	}
}
