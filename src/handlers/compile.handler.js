'use strict'

const {errors, ZoolLogger} = require('zool-utils')
const log = ZoolLogger(require('../../package.json').name)
const {SrcNotFoundError} = errors

const {compile} = require('../services/compile.service')

exports.compile = function (options) {
  return function (request, reply) {
    compile(request.params.module, options)
      .then((css) => {
        reply(css).type('text/css')
      })
      .catch(SrcNotFoundError, (err) => {
        log.warn('NotFound', err.message)
        reply(`Not Found: ${request.path}`).code(404)
      })
      .catch((err) => {
        log.error('Internal Server Error', err.message)
        reply(err.message).code(500)
      })
  }
}
