'use strict'

const {expect, Workspace} = require('./support')
const Hapi = require('hapi')
const route = require('../src/route')

describe('zool-stylus: default settings', () => {
  const workspace = Workspace.create('zool-stylus-route')
  let server

  before(async () => {
    workspace.addSrcFiles([
      { name: 'compile-me/index.styl', content: '$test-color = blue; body { color: $test-color; }' },
      { name: 'no-compile/index.styl', content: 'body { == color: @background-color; }' }
    ])

    server = new Hapi.Server()
    server.connection({ port: 8000 })
    await server.register([ { register: route, options: { src: workspace.srcDir, dest: workspace.outputDir } } ])
  })

  after(() => {
    workspace.reset()
    server.stop()
  })

  it('should compile a stylus file', async () => {
    const response = await server.inject({ method: 'GET', url: '/css/compile-me.css' })

    expect(response.headers[ 'content-type' ]).to.be.equal('text/css; charset=utf-8')
    expect(response.statusCode).to.be.equal(200)
    expect(response.payload).to.be.equal('body{color:#00f}')
  })

  it('should write the output to a css file', async () => {
    await server.inject({ method: 'GET', url: '/css/compile-me.css' })
    expect(workspace.fileContents('compile-me.css')).to.be.equal('body{color:#00f}')
  })

  it('should return a 404 if file not found', async () => {
    const response = await server.inject({ method: 'GET', url: '/css/unknown.css' })
    expect(response.statusCode).to.be.equal(404)
    expect(response.payload).to.be.equal('Not Found: /css/unknown.css')
  })

  it('should return a 500 if file won\'t compile', async () => {
    const response = await server.inject({ method: 'GET', url: '/css/no-compile.css' })
    expect(response.statusCode).to.be.equal(500)
    expect(response.payload).to.include('missing left-hand operand')
  })
})
