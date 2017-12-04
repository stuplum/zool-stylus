'use strict'

const {dirname, resolve, join} = require('path')
const {readFileSync, writeFileSync} = require('fs')
const {sync: mkdirpSync} = require('mkdirp')
const {expect} = require('chai')
const rimraf = require('rimraf')
const {TempDir} = require('zool-test-support')

class Workspace {

  static create (dirName, publicDir) {
    return new Workspace(dirName, publicDir)
  }

  constructor (testDirName, outputPath) {
    this.tempDir = new TempDir(testDirName)
    this.outputPath = outputPath
  }

  addOutputFiles (files) {
    files.forEach(({name, content}) => {
      const fullPath = join(this.outputDir, name)
      mkdirpSync(dirname(fullPath), 0x1c0)
      writeFileSync(fullPath, content, 'utf8')
    })
  }

  addSrcFiles (files) {
    this.tempDir.create(files.reduce((prev, curr) => {
      return Object.assign({}, prev, {[curr.name]: curr.content})
    }, {}))
  }

  fileContents (fileName) {
    return readFileSync(resolve(this.outputDir, fileName), 'utf-8')
  }

  reset () {
    this.tempDir.cleanUp()
    rimraf.sync(this.outputDir)
  }

  get srcDir () {
    return this.tempDir.path
  }

  get outputDir () {
    return resolve(__dirname, `../..${this.outputPath}`)
  }
}

async function thrown (fn) {
  try {
    await fn()
  } catch (ex) {
    return ex.constructor
  }

  throw new Error('Expected function to throw an error but no error was thrown')
}

module.exports = {
  expect,
  Workspace,
  thrown
}
