'use strict'

const {expect, thrown, Workspace} = require('../../../test/support')
const {getInstalledPath} = require('get-installed-path')

const {CompilationError} = require('zool-utils').errors

const stylus = require('.')

describe('stylus.service', () => {
  const workspace = Workspace.create('zool-stylus-stylus')

  afterEach(() => {
    workspace.reset()
  })

  describe('with valid stylus', () => {
    describe('file handling', () => {
      it('should read render stylus from file', async () => {
        workspace.addSrcFiles([
          { name: 'style/file.styl', content: 'body { color: red; }' }
        ])

        expect(
          await stylus.compileStylus({ srcPath: `${workspace.srcDir}/style/file.styl` })
        ).to.be.equal('body{color:#f00}')
      })

      it('should render stylus from directory', async () => {
        workspace.addSrcFiles([
          { name: 'style/directory/index.styl', content: 'body { color: blue; }' }
        ])

        expect(
          await stylus.compileStylus({ srcPath: `${workspace.srcDir}/style/directory/index.styl` })
        ).to.be.equal('body{color:#00f}')
      })
    })

    describe('compress', () => {
      it('should have option to disable compression', async () => {
        workspace.addSrcFiles([
          { name: 'style/no-compress.styl', content: 'body { color: green; }' }
        ])

        expect(
          await stylus.compileStylus({ compress: false, srcPath: `${workspace.srcDir}/style/no-compress.styl` })
        ).to.be.equal('body {\n  color: #008000;\n}\n')
      })
    })

    describe('firebug', () => {
      it('should output firebug debug comments in css', async () => {
        workspace.addSrcFiles([
          { name: 'style/firebug.styl', content: 'body { color: yellow; }' }
        ])

        expect(
          await stylus.compileStylus({ firebug: true, srcPath: `${workspace.srcDir}/style/firebug.styl` })
        ).to.include('@media -stylus-debug-info')
      })
    })

    describe('linenos', () => {
      it('should output stylus line numbers in css', async () => {
        workspace.addSrcFiles([
          { name: 'style/linenos.styl', content: 'body { color: purple; }' }
        ])

        const stylusPath = await getInstalledPath('stylus', { local: true })

        const cssWithComments = `
/* line 1 : /private${workspace.srcDir}/style/linenos.styl */

/* line 1 : ${stylusPath}/lib/functions/index.styl */

/* line 1 : /private${workspace.srcDir}/style/linenos.styl */
body{color:#800080}`

        expect(
          await stylus.compileStylus({ linenos: true, srcPath: `${workspace.srcDir}/style/linenos.styl` })
        ).to.be.equal(cssWithComments)
      })
    })

    describe('sourcemap', () => {
      it('should output stylus line numbers in css', async () => {
        workspace.addSrcFiles([
          { name: 'style/sourcemap.styl', content: 'body { color: yellow; }' }
        ])

        expect(
          await stylus.compileStylus({ sourcemap: true, srcPath: `${workspace.srcDir}/style/sourcemap.styl` })
        ).to.include('sourceMappingURL=')
      })
    })
  })

  describe('with invalid stylus', () => {
    it('should throw error if stylus file is not found', async () => {
      workspace.addSrcFiles([
        { name: 'style/no-compile/index.styl', content: '$test-color = ; body { color: $test-color; }' }
      ])

      expect(await thrown(() =>
        stylus.compileStylus({ srcPath: `${workspace.srcDir}/style/no-compile/index.styl` })
      )).to.equal(CompilationError)
    })
  })
})
