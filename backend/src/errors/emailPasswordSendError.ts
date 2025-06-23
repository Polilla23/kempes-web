export class EmailPasswordSendError extends Error {
    constructor(message = "Failed to send password reset email.") {
        super(message)
        this.name = "EmailPasswordSendError"
    }
}
