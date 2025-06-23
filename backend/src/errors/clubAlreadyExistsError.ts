export class ClubAlreadyExistsError extends Error {
    constructor(message = "Club already exists.") {
        super(message)
        this.name = "ClubAlreadyExistsError"
    }
}