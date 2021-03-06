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

const {fileAge} = require('zool-utils')
const {compileStylus: compile} = require('../stylus.service')

const {DestNotFoundError} = require('zool-utils').errors

function compileAndWriteResult (config, destination) {
  return compile(config)
    .then(function (css) {
      return mkdirp(dirname(destination), 0x1c0)
        .then(function () {
          return writeFile(destination, css, 'utf8')
            .then(function () {
              return css
            })
        })
    })
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
    const destPath = resolve(join(options.dest, componentName))
    const srcPath = resolve(`${componentPath}/${options.entryPoint}.${options.extension}`)

    options.srcPath = srcPath
    options.destPath = destPath

    return fileAge({ src: srcPath, dest: destPath })
      .then(function (age) {
        if (age.srcIsNewer || options.force) {
          return compileAndWriteResult(options, destPath)
        } else {
          return readFile(destPath, 'utf-8')
        }
      })
      .catch(DestNotFoundError, function () {
        return compileAndWriteResult(options, destPath)
      })
  }
}