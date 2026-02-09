export class CommentNotFoundError extends Error {
  constructor() {
    super('Comment not found')
    this.name = 'CommentNotFoundError'
  }
}

export class UnauthorizedCommentAccessError extends Error {
  constructor() {
    super('You do not have permission to modify this comment')
    this.name = 'UnauthorizedCommentAccessError'
  }
}
