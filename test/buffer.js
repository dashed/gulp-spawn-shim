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
queue = require('async-queue-stream'),
helper = require('./helper');

describe('When gulp.src in buffer mode,', function() {

    describe("with cmd that takes stdin and posts to stdout,", function() {

        it("should output correct file", function(done) {

            var opts = {};
            opts.cmd = 'sort';
            opts.args = [];
            opts.args.push('-k2');

            var
            file_call = 0,
            failure_call = 0,
            stderr_call = 0,
            exit_call = 0,
            exit_sum = 0;

            var check = queue(function(file, callback) {

                helper.get_buffer_checksum(file.contents, function(real_checksum) {

                    helper.get_actual_checksum(file, function(actual_checksum) {
                        file_call++;

                        expect(real_checksum)
                            .to.equal(actual_checksum);

                        return callback();
                    });
                });
            });


            gulp.src(helper.rawFixtures, {buffer: true})
                .pipe(spawn(opts))
                    .on('failure', function(err) {
                        failure_call++;
                    })
                    .on('stderr', function(stderr) {
                        stderr_call++;
                    })
                    .on('exit', function(exit) {
                        exit_call++;
                        exit_sum += exit;

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
