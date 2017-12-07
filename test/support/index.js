'use strict'

const {expect} = require('chai')
const {Workspace} = require('zool-test-support')

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
