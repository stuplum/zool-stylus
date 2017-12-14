'use strict'

const {ZoolLogger} = require('zool-utils')
const logger = ZoolLogger(require('../../package.json').name)

const {SrcNotFoundError} = require('zool-utils').errors

const {compile} = require('../services/compile.service')

exports.compile = function (options) {
  return function (request, reply) {
    compile(request.params.module, options)
      .then((css) => {
        reply(css).type('text/css')
      })
      .catch(SrcNotFoundError, (err) => {
        logger.warn('NotFound', err.message)
        reply(`Not Found: ${request.path}`).code(404)
      })
      .catch((err) => {
        logger.error('Internal Server Error', err.message)
        return reply(err.message).code(500)
      })
  }
}
