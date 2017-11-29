'use strict';

global.sinon   = require('sinon');
global.chai    = require('chai');
global.expect  = require('chai').expect;
global.should  = require('chai').should();

global.rimraf = require('rimraf');

global.Temp = require('zool-test-support').TempDir;

const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const resolve = require('path').resolve;
const readFileSync = require('fs').readFileSync;

global.publicDir = resolve(__dirname, '../public/css');

global.cssFile = path => readFileSync(resolve(publicDir, path), 'utf-8');
