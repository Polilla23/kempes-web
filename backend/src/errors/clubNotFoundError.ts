export class ClubNotFoundError extends Error {
    constructor(message = "Club not found.") {
        super(message)
        this.name = "ClubNotFoundError"
    }
}