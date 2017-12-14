'use strict'

const handlers = require('../handlers/compile.handler')

module.exports = function (routeConfig) {
  return [{
    method: 'GET',
    path: routeConfig.routePath,
    config: {
      description: 'get compiled stylus from css url',
      handler: handlers.compile(routeConfig)
    }
  }]
}
