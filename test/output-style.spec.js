'use strict';

const Hapi = require('hapi');

describe('zool-stylus: outputStyle', function () {

    const temp = new Temp('zool-stylus-route');

    let server;

    before(function () {
        temp.create({ 'output-style/index.styl': '$test-color = red; body { color: $test-color; }' });
    });

    after(function () {
        temp.cleanUp();
        rimraf.sync(publicDir);
    });

    beforeEach(function (done) {

        server = new Hapi.Server();
        server.connection({ port: 8000 });

        server.register([{ register: require('../lib/route'), options: { src: temp.path, compress: false } }], done);
    });

    it('should compile from a configured output style', function (done) {

        server.inject({ method: 'GET', url: '/css/output-style.css' }, function (response) {
            expect(response.statusCode).to.be.equal(200);
            expect(response.payload).to.be.equal('body {\n  color: #f00;\n}\n');
            done();
        });

    });

    it('should write the output to a css file', function (done) {

        server.inject({ method: 'GET', url: '/css/output-style.css' }, function () {
            expect(cssFile('output-style.css')).to.be.equal('body {\n  color: #f00;\n}\n');
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
