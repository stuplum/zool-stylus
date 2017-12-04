'use strict'

const {expect, Workspace} = require('./support')
const Hapi = require('hapi')

const route = require('../src/route')

describe('zool-stylus: entryPoint', () => {
  const workspace = Workspace.create('zool-stylus-route', '/public/css')
  let server

  before(async () => {
    workspace.addSrcFiles([
      { name: 'custom-entry/my-entry.styl', content: '$test-color = red; body { color: $test-color; }' }
    ])

    server = new Hapi.Server()
    server.connection({ port: 8000 })
    await server.register([ {
      register: route,
      options: { src: workspace.srcDir, entryPoint: 'my-entry' }
    } ])
  })

  after(() => {
    workspace.reset()
    server.stop()
  })

  it('should compile from a configured entry point', async () => {
    const response = await server.inject({ method: 'GET', url: '/css/custom-entry.css' })
    expect(response.statusCode).to.be.equal(200)
    expect(response.payload).to.be.equal('body{color:#f00}')
  })

  it('should write the output to a css file', async () => {
    await server.inject({ method: 'GET', url: '/css/custom-entry.css' })
    expect(workspace.fileContents('custom-entry.css')).to.be.equal('body{color:#f00}')
  })

  it('should return a 404 if file not found', async () => {
    const {statusCode} = await server.inject({ method: 'GET', url: '/css/unknown.css' })
    expect(statusCode).to.be.equal(404)
  })
})
