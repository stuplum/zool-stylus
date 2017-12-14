'use strict'

const Hoek = require('hoek')

const dirname = require('path').dirname
const join = require('path').join
const resolve = require('path').resolve

const fs = require('fs')
const Promise = require('bluebird')
const mkdirp = Promise.promisifyAll(require('mkdirp')).mkdirpAsync
const readFile = Promise.promisify(fs.readFile)
const writeFile = Promise.promisify(fs.writeFile)

const fileAge = require('../file-age.service')
const {
  compileStylus: compile,
  extractResult
} = require('../stylus.service')

const DestNotFoundError = require('../../errors/dest-not-found.error')

function compileAndWriteResult (config, destination) {
  return compile(config)
    .then(extractResult(function (css) {
      return mkdirp(dirname(destination), 0x1c0)
        .then(function () {
          return writeFile(destination, css, 'utf8')
            .then(function () {
              return css
            })
        })
    }))
}

function applyDefaults (options) {
  const defaults = {
    entryPoint: 'index',
    extension: 'styl',
    src: './lib/styl',
    dest: './public/css'
  }

  options = Hoek.applyToDefaults(defaults, options || {})

  if (!options.paths) {
    options.paths = [options.src]
  }

  return options
}

function removeFileExtension (componentName) {
  return componentName.replace('.css', '')
}

module.exports = {

  compile: function (componentName, options) {
    options = applyDefaults(options)

    const componentPath = `${options.src}/${removeFileExtension(componentName)}`
    const destinationPath = resolve(join(options.dest, componentName))
    const srcPath = resolve(`${componentPath}/${options.entryPoint}.${options.extension}`)

    options.componentPath = componentPath
    options.srcPath = srcPath

    return fileAge({ src: srcPath, dest: destinationPath })
      .then(function (age) {
        if (age.srcIsNewer || options.force) {
          return compileAndWriteResult(options, destinationPath)
        } else {
          return readFile(destinationPath, 'utf-8')
        }
      })
      .catch(DestNotFoundError, function () {
        return compileAndWriteResult(options, destinationPath)
      })
  }
}