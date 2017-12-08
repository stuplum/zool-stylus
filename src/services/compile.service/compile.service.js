'use strict';

const Hoek = require('hoek');

const join = require('path').join;
const resolve = require('path').resolve;

const fs = require('fs');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);

const fileAge = require('../file-age.service')
const compile = require('../stylus.service').compileStylus;

const DestNotFoundError = require('../../errors/dest-not-found.error')

const zoolLogger = require('zool-utils').ZoolLogger;
const logger = zoolLogger('zool-stylus');

const defaults = {
  entryPoint: 'index',
  extension: 'styl',
  src: './lib/styl',
  dest: './public/css'
};

module.exports = {

  compile: function (componentName, compileConfig) {

    compileConfig = compileConfig || {};

    const paths = compileConfig.paths;

    compileConfig = Hoek.applyToDefaults(defaults, compileConfig);

    if (!paths) {
      compileConfig.paths = [compileConfig.src];
    }

    const componentPath = `${compileConfig.src}/${componentName}`;
    const destinationPath = resolve(join(compileConfig.dest, componentName + '.css'));
    const srcPath = resolve(`${componentPath}/${compileConfig.entryPoint}.${compileConfig.extension}`);

    compileConfig.componentPath = componentPath;
    compileConfig.destinationPath = destinationPath;
    compileConfig.srcPath = srcPath;

    return fileAge({ src: srcPath, dest: destinationPath })
      .then(function (age) {
        if (age.srcIsNewer || compileConfig.force) {
          if (compileConfig.debug) {
            logger.debug(compileConfig.force ? 'Forcing compilation' : 'Compiled css out of date:', destinationPath);
          }
          return compile(compileConfig);
        } else {
          return readFile(destinationPath, 'utf-8');
        }
      })
      .catch(DestNotFoundError, function (err) {
        if (compileConfig.debug) {
          logger.debug('Compiled css not found:', err);
        }
        return compile(compileConfig);
      })
  }
};