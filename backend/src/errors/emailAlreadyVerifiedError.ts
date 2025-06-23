export class EmailAlreadyVerifiedError extends Error {
    constructor(message = "Email already verified.") {
        super(message)
        this.name = "EmailAlreadyVerifiedError"
    }
}