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
spawn = require('../'),
gulp = require('gulp'),
// es = require('event-stream'),
queue = require('async-queue-stream'),
// through = require('through'),
helper = require('./helper');

describe('When gulp.src in stream mode,', function() {

    var
    opts = {},
    file_call = 0,
    failure_call = 0,
    stderr_call = 0,
    exit_call = 0,
    exit_sum = 0;

    beforeEach(function() {
        opts = {};
        file_call = 0;
        failure_call = 0;
        stderr_call = 0;
        exit_call = 0;
        exit_sum = 0;
    });

    describe("with cmd that takes stdin and posts to stdout,", function() {

        it("should output correct file", function(done) {

            opts.cmd = 'sort';
            opts.args = [];
            opts.args.push('-k2');

            var check = queue(function(file, callback) {

                helper.get_actual_checksum(file, function(actual_checksum) {

                    helper.get_stream_checksum(file.contents, function(real_checksum) {

                        file_call++;
                        expect(real_checksum)
                            .to.equal(actual_checksum);

                        return callback();
                    });
                });
            });


            gulp.src(helper.rawFixtures, {buffer: false})
                .pipe(spawn(opts))
                    .on('failure', function(err) {
                        failure_call++;
                    })
                    .on('stderr', function(stderr) {
                        stderr_call++;
                    })
                    .on('exit', function(exit) {
                        exit_call++;
                    })
                .pipe(check)
                .once('end', function() {

                    helper.pass(done, function() {
                        // should occur
                        expect(file_call).to.equal(3);
                        expect(exit_call).to.equal(3);
                        expect(exit_sum).to.equal(0);

                        // should never occur
                        expect(failure_call).to.equal(0);
                        expect(stderr_call).to.equal(0);
                    });

                });
        });
    });
});
