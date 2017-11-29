'use strict'

const ZoolError = require('./error')

class SrcNotFoundError extends ZoolError {
  constructor (message) {
    super(message)
    this.code = 'ENOENT'
  }
}

module.exports = SrcNotFoundError
