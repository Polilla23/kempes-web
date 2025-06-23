export class EmailSendError extends Error {
    constructor(message = "Failed to send verification email. Please try registering again.") {
        super(message)
        this.name = "EmailSendError"
    }
}