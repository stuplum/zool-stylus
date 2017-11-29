'use strict';

const PLUGIN_NAME = 'zool-stylus';

const Boom = require('boom');
const Hoek = require('hoek');
const Inert = require('inert');

const compile = require('../compiler').compile;

const zoolUtils = require('zool-utils');
const onBoom = zoolUtils.onBoom;
const zoolLogger = zoolUtils.ZoolLogger;
const logger = zoolLogger(PLUGIN_NAME);

const defaults = {
  debug: false,
  routePath: '/css/{module*}'
};

module.exports.compile = compile;

module.exports.register = function (server, options, next) {

  const routeConfig = Hoek.applyToDefaults(defaults, options);

  server.register(Inert, () => {});

  server.ext('onPreResponse', onBoom((request, reply) => {

    const error = request.response;
    const errorPayload = request.response.output.payload;
    const statusCode = errorPayload.statusCode;
    const replyText = statusCode === 404 ? `${errorPayload.error}: ${request.path}` : error.message;

    logger[ statusCode === 404 ? 'warn' : 'error' ](errorPayload.error, error.message);

    return reply(replyText).code(statusCode);

  }, PLUGIN_NAME));

  server.route({
    method: 'GET',
    path: routeConfig.routePath,
    handler: function (request, reply) {

      const componentName = request.params.module.replace('.css', '');

      compile(componentName, routeConfig)

        .then(function (css) {
          reply(css).type('text/css');
        })

        .catch(function (err) {
          const notFoundError = err.code && err.code === 'ENOENT';
          const error = notFoundError ? 'notFound' : 'internal';

          reply(Boom[ error ](err, { from: PLUGIN_NAME }));
        });
    }
  });

  next();
};

exports.register.attributes = {
  pkg: require('../../package.json')
};
