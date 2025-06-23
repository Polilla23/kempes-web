export class SamePasswordError extends Error {
    constructor(message = "Invalid new password. The password must be different from the old one.") {
        super(message)
        this.name = "SamePasswordError"
    }
}