export class FileNotFoundError extends Error {
  constructor() {
    super('File not found')
    this.name = 'FileNotFoundError'
  }
}

export class InvalidFileTypeError extends Error {
  constructor(allowedTypes: string[]) {
    super(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
    this.name = 'InvalidFileTypeError'
  }
}

export class FileSizeExceededError extends Error {
  constructor(maxSize: number) {
    super(`File size exceeds maximum allowed (${maxSize} bytes)`)
    this.name = 'FileSizeExceededError'
  }
}

export class UploadFailedError extends Error {
  constructor(message: string) {
    super(`Upload failed: ${message}`)
    this.name = 'UploadFailedError'
  }
}

export class DeleteFailedError extends Error {
  constructor(message: string) {
    super(`Delete failed: ${message}`)
    this.name = 'DeleteFailedError'
  }
}
