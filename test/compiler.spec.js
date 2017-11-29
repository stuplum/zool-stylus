'use strict';

const mkdirp = require('mkdirp').sync;
const writeFile = require('fs').writeFileSync;

describe('zool-stylus: compiler', function () {

  const temp = new Temp('zool-stylus-compiler');
  const compiler = require('../src/compiler');

  after(function () {
    temp.cleanUp();
    rimraf.sync(publicDir);
  });

  describe('with existing css', function () {

    before(function (done) {

      mkdirp(`${publicDir}/old`, 0x1c0);
      writeFile(`${publicDir}/old/css.css`, 'body { color: brown; }', 'utf8');

      setTimeout(function () {

        temp.create({
          'new/css/index.styl': 'body { color: yellow; }',
          'old/css/index.styl': 'body { color: green; }'
        });

        done();

      }, 1000);

    });

    it('should read css from existing css file when css file is newer than stylus file', function (done) {

      // Given:
      mkdirp(`${publicDir}/new`, 0x1c0);
      writeFile(`${publicDir}/new/css.css`, 'body { color: pink; }', 'utf8');

      // Then:
      compiler

        .compile('new/css', { src: temp.path })

        .then(function (css) {
          expect(css).to.be.equal('body { color: pink; }');
          done();
        })

        .catch(done);

    });

    it('should compile from stylus when css file is newer but force option is set to true', function (done) {

      // Given:
      mkdirp(`${publicDir}/new`, 0x1c0);
      writeFile(`${publicDir}/new/css.css`, 'body { color: purple; }', 'utf8');

      // Then:
      compiler

        .compile('new/css', { src: temp.path, force: true })

        .then(function (css) {
          expect(css).to.be.equal('body{color:#ff0}');
          done();
        })

        .catch(done);

    });

    it('should compile stylus when css file is older than styl file', function (done) {

      compiler

        .compile('old/css', { src: temp.path })

        .then(function (css) {
          expect(css).to.be.equal('body{color:#008000}');
          done();
        })

        .catch(done);

    });

  });

  describe('with no existing css', function () {

    before(function () {
      temp.create({
        'compile-me/index.styl': '$test-color = blue; body { color: $test-color; }',
        'compile-me-too/index.styl': '$test-color = red; body { color: $test-color; }',
        'compile-me-also/index.styl': '$test-color = green; body { color: $test-color; }',
        'no-compile/index.styl': '$test-color = ; body { color: $test-color; }'
      });
    });

    it('should compile a stylus file and return css', function (done) {

      compiler

        .compile('compile-me', { src: temp.path })

        .then(function (css) {
          expect(css).to.be.equal('body{color:#00f}');
          done();
        })

        .catch(done);

    });

    it('should compile a stylus file and save to css file in default location', function (done) {

      compiler

        .compile('compile-me-too', { src: temp.path })

        .then(function () {
          expect(cssFile('compile-me-too.css')).to.be.equal('body{color:#f00}');
          done();
        })

        .catch(done);

    });

    it('should return same value as saved to compiled css file', function (done) {

      compiler

        .compile('compile-me-also', { src: temp.path })

        .then(function (css) {
          expect(cssFile('compile-me-also.css')).to.be.equal(css);
          done();
        })

        .catch(done);

    });

    it('should throw error if stylus file is not found', function (done) {

      compiler

        .compile('unknown')

        .then(function (err) {
          done(new Error('Should not have found a stylus file'));
        })

        .catch(function (err) {
          expect(err.code).to.be.equal('ENOENT');
          done();
        });

    });

    it('should throw an error if stylus file won\'t compile', function (done) {

      compiler

        .compile('no-compile', { src: temp.path })

        .then(function () {
          done(new Error('Should not have compiled the stylus file'));
        })

        .catch(function (err) {
          expect(err.name).to.equal('ParseError');
          expect(err.message).to.contain('invalid right-hand side operand in assignment, got ";"');
          done();
        });
    });
  });
});
