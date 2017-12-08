'use strict';

const Hoek = require('hoek');

const fs = require('fs');
const Promise = require('bluebird');
const dirname = require('path').dirname;

const render = Promise.promisify(require('stylus').render)
const mkdirp = Promise.promisifyAll(require('mkdirp')).mkdirpAsync;
const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);
const CompilationError = require('../../errors/compilation.error');

const zoolLogger = require('zool-utils').ZoolLogger;
const logger = zoolLogger('zool-stylus');

const defaults = {
  force: false,
  compress: true,
  firebug: false,
  linenos: false,
  sourcemap: false,
  paths: []
};

function toStylusConfig (config) {
  const srcDir = dirname(config.srcPath);
  return Object.assign({}, config, {
    filename: config.componentPath,
    paths: config.paths ? [srcDir].concat(config.paths) : undefined
  });
}

module.exports = {

  compileStylus: function (_config) {
    const config = Hoek.applyToDefaults(defaults, toStylusConfig(_config));

    if (config.debug) {
      logger.debug('Compile config', config);
    }

    return readFile(config.srcPath, 'utf-8')
      .then(function (content) {
        return render(content, config)
          .then(function (result) {

            if (config.debug) {
              logger.debug('render', 'compilation ok');
            }

            return mkdirp(dirname(config.destinationPath), 0x1c0)

              .then(function (generatedPath) {

                if (config.debug) {
                  logger.debug('mkdirp', generatedPath);
                }

                return writeFile(config.destinationPath, result, 'utf8')

                  .then(function () {

                    if (config.debug) {
                      logger.debug('CSS file written to:', config.destinationPath);
                    }

                    return result.toString();
                  });
              });
          })
          .catch(function (err) {
            throw new CompilationError(err.message);
          })
      });
  }
};
