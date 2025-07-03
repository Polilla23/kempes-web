import { UserRepository } from "../repositories/user.repository";

// Errors
import { UserNotFoundError } from "../errors/userNotFoundError";
import { RoleType } from "@prisma/client";

export class MyAccountService {
    private userRepository: UserRepository
    
    constructor({ userRepository }: { userRepository: UserRepository }) {
        this.userRepository = userRepository
    }

    async getUserData(id: string): Promise<{ email: string, isVerified: boolean, verificationTokenExpires: Date | any }> {
        const userFound = await this.userRepository.findOneById(id);

        if (!userFound) {
            throw new UserNotFoundError()
        }

        return {
            email: userFound.email,
            isVerified: userFound.isVerified,
            verificationTokenExpires: userFound.verificationTokenExpires
        }
    }
}