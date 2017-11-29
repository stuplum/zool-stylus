'use strict';

const Hapi = require('hapi');

describe('zool-stylus: entryPoint', function () {

    const temp = new Temp('zool-stylus-route');

    let server;

    before(function () {
        temp.create({ 'custom-entry/my-entry.styl': '$test-color = red; body { color: $test-color; }' });
    });

    after(function () {
        temp.cleanUp();
        rimraf.sync(publicDir);
    });

    beforeEach(function (done) {

        server = new Hapi.Server();
        server.connection({ port: 8000 });

        server.register([{ register: require('../lib/route'), options: { src: temp.path, entryPoint: 'my-entry' } }], done);
    });

    it('should compile from a configured entry point', function (done) {

        server.inject({ method: 'GET', url: '/css/custom-entry.css' }, function (response) {
            expect(response.statusCode).to.be.equal(200);
            expect(response.payload).to.be.equal('body{color:#f00}');
            done();
        });

    });

    it('should write the output to a css file', function (done) {

        server.inject({ method: 'GET', url: '/css/custom-entry.css' }, function () {
            expect(cssFile('custom-entry.css')).to.be.equal('body{color:#f00}');
            done();
        });

    });

    it('should return a 404 if file not found', function (done) {

        server.inject({ method: 'GET', url: '/css/unknown.css' }, function (response) {
            expect(response.statusCode).to.be.equal(404);
            done();
        });

    });

});
