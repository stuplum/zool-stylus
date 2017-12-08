'use strict'

const {ZoolLogger} = require('zool-utils')
const logger = ZoolLogger(require('../../package.json').name)

const SrcNotFoundError = require('../errors/src-not-found.error')

const {compile} = require('../services/compile.service')

exports.compile = function (routeConfig) {
  return function (request, reply) {
    const componentName = request.params.module.replace('.css', '')

    compile(componentName, routeConfig)
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
