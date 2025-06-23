export class EmailNotVerifiedError extends Error {
    constructor(message = "Email not verified.") {
        super(message)
        this.name = "EmailNotVerifiedError"
    }
}