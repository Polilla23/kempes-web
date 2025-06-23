export class GenerateTokenError extends Error {
    constructor(message = "Failed to generate token.") {
        super(message)
        this.name = "GenerateTokenError"
    }
}