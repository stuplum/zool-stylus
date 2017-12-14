'use strict'

const Hoek = require('hoek')

const fs = require('fs')
const Promise = require('bluebird')
const dirname = require('path').dirname

const render = Promise.promisify(require('stylus').render)
const readFile = Promise.promisify(fs.readFile)
const CompilationError = require('../../errors/compilation.error')

function toStylusOption (option) {
  const srcDir = dirname(option.srcPath)
  return Object.assign({}, option, {
    filename: option.srcPath,
    paths: option.paths ? [srcDir].concat(option.paths) : undefined
  })
}

function applyDefaults (options) {
  const defaults = {
    force: false,
    compress: true,
    firebug: false,
    linenos: false,
    sourcemap: false,
    cache: false,
    paths: []
  }
  return  Hoek.applyToDefaults(defaults, toStylusOption(options))
}

module.exports = {

  compileStylus: function (options) {
    options = applyDefaults(options)

    return readFile(options.srcPath, 'utf-8')
      .then(function (content) {
        return render(content, options)
          .catch(function (err) {
            throw new CompilationError(err.message)
          })
      })
  },

  extractResult: function (cb) {
    return function (result) {
      return cb(result.toString())
    }
  }
}
