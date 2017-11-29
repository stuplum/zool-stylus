'use strict'

class ZoolError extends Error {

  constructor (message) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
  }
}

module.exports = ZoolError
