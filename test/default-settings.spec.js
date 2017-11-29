'use strict';

const Hapi = require('hapi');

describe('zool-stylus: default settings', function () {

    const temp = new Temp('zool-stylus-route');

    let server;

    before(function () {
        temp.create({
            'compile-me/index.styl': '$test-color = blue; body { color: $test-color; }',
            'no-compile/index.styl': 'body { == color: @background-color; }'
            // 'no-compile/index.styl': '$wrong-color: black; body { color: $wrong-color; }'
        });
    });

    after(function () {
        temp.cleanUp();
        rimraf.sync(publicDir);
    });

    beforeEach(function (done) {

        server = new Hapi.Server();
        server.connection({ port: 8000 });

        server.register([{ register: require('../src/route'), options: { src: temp.path } }], done);
    });

    it('should compile a stylus file', function (done) {

        server.inject({ method: 'GET', url: '/css/compile-me.css' }, function (response) {
            expect(response.headers['content-type']).to.be.equal('text/css; charset=utf-8');
            expect(response.statusCode).to.be.equal(200);
            expect(response.payload).to.be.equal('body{color:#00f}');
            done();
        });

    });

    it('should write the output to a css file', function (done) {

        server.inject({ method: 'GET', url: '/css/compile-me.css' }, function () {
            expect(cssFile('compile-me.css')).to.be.equal('body{color:#00f}');
            done();
        });

    });

    it('should return a 404 if file not found', function (done) {

        server.inject({ method: 'GET', url: '/css/unknown.css' }, function (response) {
            expect(response.statusCode).to.be.equal(404);
            expect(response.payload).to.be.equal('Not Found: /css/unknown.css');
            done();
        });

    });

    it('should return a 500 if file won\'t compile', function (done) {

        server.inject({ method: 'GET', url: '/css/no-compile.css' }, function (response) {
            expect(response.statusCode).to.be.equal(500);
            expect(response.payload).to.include('missing left-hand operand');
            done();
        });

    });

});
