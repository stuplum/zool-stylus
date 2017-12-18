'use strict'

const {defaults, pick} = require('lodash')

const fs = require('fs')
const Promise = require('bluebird')
const dirname = require('path').dirname

const render = Promise.promisify(require('stylus').render)
const readFile = Promise.promisify(fs.readFile)
const {CompilationError} = require('zool-utils').errors

function applyDefaults (options) {
  const DEFAULTS = {
    force: false,
    compress: true,
    firebug: false,
    linenos: false,
    sourcemap: false,
    cache: false
  }
  const srcDir = isDirectory(options.srcPath) ? options.srcPath : dirname(options.srcPath)

  options = Object.assign({}, pick(options, Object.keys(DEFAULTS)), {
    filename: options.srcPath,
    paths: options.paths ? [srcDir].concat(options.paths) : [srcDir]
  })

  return defaults(options, DEFAULTS)
}

function isDirectory (src) {
  return fs.lstatSync(src).isDirectory()
}

function getSrc ({srcPath, entryPoint = 'index', extension = 'styl'}) {
  return isDirectory(srcPath) ? `${srcPath}/${entryPoint}.${extension}` : srcPath
}

module.exports = {

  compileStylus: function (options) {
    return readFile(getSrc(options), 'utf-8')
      .then(function (content) {
        const opts = applyDefaults(options)
        return render(content, opts)
          .catch(function (err) {
            throw new CompilationError(err.message)
          })
      })
  }
}
