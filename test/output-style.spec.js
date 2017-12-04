'use strict'

const {expect, Workspace} = require('./support')
const Hapi = require('hapi')

const route = require('../src/route')

describe('zool-stylus: outputStyle', () => {
  const workspace = Workspace.create('zool-stylus-route', '/public/css')
  let server

  before(async () => {
    workspace.addSrcFiles([
      { name: 'output-style/index.styl', content: '$test-color = red; body { color: $test-color; }' }
    ])

    server = new Hapi.Server()
    server.connection({ port: 8000 })
    await server.register([{
      register: route,
      options: { src: workspace.srcDir, compress: false }
    }])
  })

  after(() => {
    workspace.reset()
    server.stop()
  })

  it('should compile from a configured output style', async () => {
    const response = await server.inject({ method: 'GET', url: '/css/output-style.css' })
    expect(response.statusCode).to.be.equal(200)
    expect(response.payload).to.be.equal('body {\n  color: #f00;\n}\n')
  })

  it('should write the output to a css file', async () => {
    await server.inject({ method: 'GET', url: '/css/output-style.css' })
    expect(workspace.fileContents('output-style.css')).to.be.equal('body {\n  color: #f00;\n}\n')
  })

  it('should return a 404 if file not found', async () => {
    const {statusCode} = await server.inject({ method: 'GET', url: '/css/unknown.css' })
    expect(statusCode).to.be.equal(404)
  })
})
