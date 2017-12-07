'use strict'

const {expect, Workspace} = require('./support')
const Hapi = require('hapi')

const route = require('../')

describe('zool-stylus: route', () => {
  const workspace = Workspace.create('zool-stylus-route')
  let server

  before(async () => {
    workspace.addSrcFiles([
      { name: 'not-important/index.styl', content: 'body {}' }
    ])

    server = new Hapi.Server()
    server.connection({ port: 8000 })
    await server.register([{
      register: route,
      options: {
        dest: workspace.outputDir,
        src: workspace.srcDir
      }
    }])
  })

  after(() => {
    workspace.reset()
  })

  it('should be exported', async () => {
    const {statusCode} = await server.inject({ method: 'GET', url: '/css/not-important.css' })
    expect(statusCode).to.be.equal(200)
  })
})
