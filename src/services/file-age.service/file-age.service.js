'use strict';

const fs = require('fs');
const Promise = require('bluebird');
const stat = Promise.promisify(fs.stat);

const DestNotFoundError = require('../../errors/dest-not-found.error');
const SrcNotFoundError = require('../../errors/src-not-found.error');

module.exports = function ({src, dest}) {
  return stat(src)
    .then(function (srcStats) {
      return stat(dest)
        .then(function (destinationStats) {
            return {
              srcIsNewer: srcStats.mtime > destinationStats.mtime,
              destIsNewer: destinationStats.mtime > srcStats.mtime
            }
        })
    })
    .catch(function (err) {
      if (err.code === 'ENOENT' && err.path === src) {
        throw new SrcNotFoundError(err.message);
      }
      if (err.code === 'ENOENT' && err.path === dest) {
        throw new DestNotFoundError(err.message);
      }
    })
}