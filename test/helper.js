var
// node.js
crypto = require('crypto'),
path = require('path'),
fs = require('fs'),

// test
chai = require('chai'),
assert = chai.assert,
should = chai.should(),
expect = chai.expect,

// misc
// spawn = require('../'),
gulp = require('gulp'),
// es = require('event-stream'),
queue = require('async-queue-stream'),
// through = require('through');
helper = {};


/// fixtures config ///

// folder
helper.fixtures = path.join(__dirname, 'fixtures');
helper.rawFixtures = path.join(helper.fixtures, 'raw/*.txt');
helper.actualFixtures = path.join(__dirname, 'fixtures/actual');
helper.actual = '_actual';

/// helper functions ///

// get checksum of actual file
helper.get_actual_checksum = function(file, cb) {

    var
    basename = path.basename(file.path),
    extname = path.extname(basename),
    filename = path.basename(basename, extname),
    actual_filename = filename + helper.actual + extname,
    actual_path = path.join(helper.actualFixtures, actual_filename);


    var shasum_actual = crypto.createHash('sha1');

    // get checksum of actual fixture
    fs.createReadStream(actual_path)
    .on('data', function(data) {
        shasum_actual.update(data);
    })
    .once('end', function() {

        return cb(shasum_actual.digest('hex'));
    });
};

// get checksum of file stream
// cb signature: function(checksum)
helper.get_stream_checksum = function(stream, cb) {

    var shasum_stream = crypto.createHash('sha1');

    stream.on('data', function(data) {
        shasum_stream.update(data);
    })
    .once('end', function() {

        return cb(shasum_stream.digest('hex'));
    });
};

// get checksum of file stream
// cb signature: function(checksum)
helper.get_buffer_checksum = function(buffer, cb) {

    var shasum_buffer = crypto.createHash('sha1');

    shasum_buffer.update(buffer);

    return cb(shasum_buffer.digest('hex'));

};

// common idiom
helper.pass = function(done, cb) {
    try {
       cb();
       done();
    } catch(e) {
        done(e);
    }
};

module.exports = helper;
