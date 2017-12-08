'use strict'

const Hoek = require('hoek')
const Inert = require('inert')

const compile = require('./services/compile.service').compile
const route = require('./routes/stylus.route')

const defaults = {
  debug: false,
  routePath: '/css/{module*}'
}

exports.compile = compile

exports.register = function (server, options, next) {
  const routeConfig = Hoek.applyToDefaults(defaults, options)
  server.register(Inert, () => {})
  server.route(route(routeConfig))
  next()
}

exports.register.attributes = {
  pkg: require('../package.json')
}
