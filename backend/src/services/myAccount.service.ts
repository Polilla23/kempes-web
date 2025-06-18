import { UserRepository } from "../repositories/user.repository";

export class MyAccountService {
    private userRepository: UserRepository
    
    constructor({ userRepository }: { userRepository: UserRepository }) {
        this.userRepository = userRepository
    }

    async getUserData(id: string): Promise<{ email: string, isVerified: boolean, verificationTokenExpires: Date | any }> {
        const user = await this.userRepository.findOneById(id);

        if (!user) {
            throw new Error('User not found')
        }

        return {
            email: user.email,
            isVerified: user.isVerified,
            verificationTokenExpires: user.verificationTokenExpires
        }
    }
}