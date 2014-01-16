var
path = require('path'),

// test
chai = require('chai'),
assert = chai.assert,
should = chai.should(),
expect = chai.expect,

// misc
// spawn = require('../'),
// gulp = require('gulp'),
// es = require('event-stream'),
queue = require('async-queue-stream'),
// through = require('through'),
helper = require('./helper');

describe('When gulp.src in stream mode,', function() {

    describe("with cmd that post to stderr,", function() {

        it("should pass files", function(done) {

            var opts = {};
            opts.cmd = path.join(__dirname, './fixtures/stderr');

            var input = {};
            input.file_call = 0;
            input.done = done;
            input.src = helper.rawFixtures;
            input.opts = opts;
            input.buffer = false;

            input.check = queue(function(___, callback) {
                input.file_call++;
                return callback();
            });


            var check = {};
            check.file_call = 0;
            check.exit_call = 3;
            check.exit_code = 0;
            check.stderr_call = 3;

            helper.process.call(this, input, check);
        });

    });

    describe("with cmd that doesn't use stdin/stdout,", function() {

        it("with cmd true, should pass files and post exit 0", function(done) {

            var opts = {};
            opts.cmd = 'true';

            var input = {};
            input.file_call = 0;
            input.done = done;
            input.src = helper.rawFixtures;
            input.opts = opts;
            input.buffer = false;

            input.check = queue(function(___, callback) {
                input.file_call++;
                return callback();
            });


            var check = {};
            check.file_call = 0;
            check.exit_call = 3;
            check.exit_code = 0;
            check.stderr_call = 0;

            helper.process.call(this, input, check);

        });

        it("with cmd false, should pass files and post exit -1", function(done) {

            var opts = {};
            opts.cmd = 'false';

            var input = {};
            input.file_call = 0;
            input.done = done;
            input.src = helper.rawFixtures;
            input.opts = opts;
            input.buffer = false;

            input.check = queue(function(___, callback) {
                input.file_call++;
                return callback();
            });


            var check = {};
            check.file_call = 0;
            check.exit_call = 3;
            check.exit_code = 1;
            check.stderr_call = 0;

            helper.process.call(this, input, check);

        });

    });

    describe("with cmd that takes stdin and posts to stdout,", function() {

        it("should output correct file", function(done) {

            this.timeout(0);

            var opts = {};
            // opts.cmd = 'sort';
            opts.cmd = 'sed';
            opts.args = [];
            // opts.args.push('-k2');
            opts.args.push("s/a/b/g");

            var input = {};
            input.file_call = 0;
            input.opts = opts;
            input.check = check;
            input.done = done;
            input.src = helper.rawFixtures;
            input.buffer = false;

            input.check = queue(function(file, callback) {

                helper.get_actual_checksum(file, function(actual_checksum) {
                    helper.get_stream_checksum(file.contents, function(real_checksum) {

                        // console.log(real_checksum);
                        // console.log(actual_checksum);

                        try {
                            expect(real_checksum)
                                .to.equal(actual_checksum);

                            input.file_call++;
                        } catch(err) {
                            done(err);
                        }

                        return callback();
                    });
                });
            });

            var check = {};
            check.file_call = 3;
            check.exit_call = 3;
            check.exit_code = 0;
            check.stderr_call = 0;

            helper.process.call(this, input, check);

        });
    });

    describe("with invalid cmd,", function() {

        it("should pass all files", function(done) {

            this.timeout(0);

            var opts = {};
            opts.cmd = 'doesnotexist';
            opts.args = [];
            opts.args.push('-k2');

            var input = {};
            input.file_call = 0;
            input.done = done;
            input.src = helper.rawFixtures;
            input.opts = opts;
            input.buffer = true;

            input.check = queue(function(___, callback) {
                input.file_call++;
                return callback();
            });

            var check = {};
            check.file_call = 0;
            check.exit_call = 3;
            check.exit_code = -1;
            // check.stderr_call = 0;

            helper.process.call(this, input, check);

        });
    });
});
