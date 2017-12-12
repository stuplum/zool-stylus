'use strict'

const {expect, thrown, Workspace} = require('../../../test/support')

const DestNotFoundError = require('../../errors/dest-not-found.error')
const SrcNotFoundError = require('../../errors/src-not-found.error')

const fileAge = require('.')

describe('file-age.service', () => {
  const workspace = Workspace.create('zool-stylus-file-age')

  after(() => {
    workspace.reset()
  })

  context('given src and destination files exist', () => {
    before((done) => {
      workspace.addSrcFiles([
        { name: 'old/file.txt', content: 'This is an old file' }
      ])

      setTimeout(() => {
        workspace.addSrcFiles([
          { name: 'new/file.txt', content: 'This is a newer file' }
        ])
        done()
      }, 1000)
    })

    context('given src file is newer than destination file', () => {
      it('should have srcIsNewer property set to true', async () => {
        const {srcIsNewer} = await fileAge({
          src: `${workspace.srcDir}/new/file.txt`,
          dest: `${workspace.srcDir}/old/file.txt`
        })

        expect(srcIsNewer).to.be.equal(true)
      })

      it('should have destIsNewer property set to false', async () => {
        const {destIsNewer} = await fileAge({
          src: `${workspace.srcDir}/new/file.txt`,
          dest: `${workspace.srcDir}/old/file.txt`
        })

        expect(destIsNewer).to.be.equal(false)
      })
    })

    context('given dest file is newer than src file', () => {
      it('should have srcIsNewer property set to false', async () => {
        const {srcIsNewer} = await fileAge({
          src: `${workspace.srcDir}/old/file.txt`,
          dest: `${workspace.srcDir}/new/file.txt`
        })

        expect(srcIsNewer).to.be.equal(false)
      })

      it('should have destIsNewer property set to true', async () => {
        const {destIsNewer} = await fileAge({
          src: `${workspace.srcDir}/old/file.txt`,
          dest: `${workspace.srcDir}/new/file.txt`
        })

        expect(destIsNewer).to.be.equal(true)
      })
    })
  })

  context('given src file is not found', () => {
    it('should throw SrcNotFound error', async () => {
      workspace.addSrcFiles([
        { name: 'lonely/file.txt', content: 'Only me' }
      ])

      expect(await thrown(() =>
        fileAge({
          src: `${workspace.srcDir}/unknown/file.txt`,
          dest: `${workspace.srcDir}/lonely/file.txt`
        })
      )).to.equal(SrcNotFoundError)
    })
  })

  context('given dest file is not found', () => {
    it('should throw DestNotFound error', async () => {
      workspace.addSrcFiles([
        { name: 'lonely/file.txt', content: 'Only me' }
      ])

      expect(await thrown(() =>
        fileAge({
          src: `${workspace.srcDir}/lonely/file.txt`,
          dest: `${workspace.srcDir}/unknown/file.txt`
        })
      )).to.equal(DestNotFoundError)
    })
  })
})
