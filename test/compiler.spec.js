'use strict'

const {expect, thrown, Workspace} = require('./support')

const CompilationError = require('../src/errors/compilation.error')
const SrcNotFoundError = require('../src/errors/src-not-found.error')

const compiler = require('../src/compiler')

describe('zool-stylus: compiler', () => {
  const workspace = Workspace.create('zool-stylus-compiler', '/public/css')

  after(() => {
    workspace.reset()
  })

  describe('with existing css', () => {
    before((done) => {
      workspace.addOutputFiles([
        { name: '/old/css.css', content: 'body { color: brown; }' }
      ])

      setTimeout(() => {
        workspace.addSrcFiles([
          { name: 'new/css/index.styl', content: 'body { color: yellow; }' },
          { name: 'old/css/index.styl', content: 'body { color: green; }' }
        ])
        done()
      }, 1000)
    })

    it('should read css from existing css file when css file is newer than stylus file', async () => {
      workspace.addOutputFiles([
        { name: '/new/css.css', content: 'body { color: pink; }' }
      ])

      expect(
        await compiler.compile('new/css', { src: workspace.srcDir })
      ).to.be.equal('body { color: pink; }')
    })

    it('should compile from stylus when css file is newer but force option is set to true', async () => {
      workspace.addOutputFiles([
        { name: '/new/css.css', content: 'body { color: purple; }' }
      ])

      expect(
        await compiler.compile('new/css', { src: workspace.srcDir, force: true })
      ).to.be.equal('body{color:#ff0}')
    })

    it('should compile stylus when css file is older than styl file', async () => {
      expect(
        await compiler.compile('old/css', { src: workspace.srcDir })
      ).to.be.equal('body{color:#008000}')
    })
  })

  describe('with no existing css', () => {
    before(() => {
      workspace.addSrcFiles([
        { name: 'compile-me/index.styl', content: '$test-color = blue; body { color: $test-color; }' },
        { name: 'compile-me-too/index.styl', content: '$test-color = red; body { color: $test-color; }' },
        { name: 'compile-me-also/index.styl', content: '$test-color = green; body { color: $test-color; }' },
        { name: 'no-compile/index.styl', content: '$test-color = ; body { color: $test-color; }' }
      ])
    })

    it('should compile a stylus file and return css', async () => {
      expect(
        await compiler.compile('compile-me', { src: workspace.srcDir })
      ).to.be.equal('body{color:#00f}')
    })

    it('should compile a stylus file and save to css file in default location', async () => {
      await compiler.compile('compile-me-too', { src: workspace.srcDir })
      expect(workspace.fileContents('compile-me-too.css')).to.be.equal('body{color:#f00}')
    })

    it('should return same value as saved to compiled css file', async () => {
      const css = await compiler.compile('compile-me-also', { src: workspace.srcDir })
      expect(workspace.fileContents('compile-me-also.css')).to.be.equal(css)
    })

    it('should throw error if stylus file is not found', async () => {
      expect(await thrown(() =>
        compiler.compile('unknown')
      )).to.equal(SrcNotFoundError)
    })

    it('should throw an error if stylus file won\'t compile: thrown()', async () => {
      expect(await thrown(() =>
        compiler.compile('no-compile', { src: workspace.srcDir })
      )).to.equal(CompilationError)
    })
  })
})
