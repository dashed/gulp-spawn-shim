var

// test
chai = require('chai'),
assert = chai.assert,
should = chai.should(),
expect = chai.expect,

// misc
// spawn = require('../'),
// gulp = require('gulp'),
queue = require('async-queue-stream'),
helper = require('./helper');

describe('When gulp.src in buffer mode,', function() {

    describe("with cmd that takes stdin and posts to stdout,", function() {

        it("should output correct file", function(done) {

            var opts = {};
            opts.cmd = 'sort';
            opts.args = [];
            opts.args.push('-k2');

            var input = {};
            input.file_call = 0;
            input.done = done;
            input.src = helper.rawFixtures;
            input.opts = opts;
            input.buffer = true;

            input.check = queue(function(file, callback) {

                helper.get_buffer_checksum(file.contents, function(real_checksum) {

                    helper.get_actual_checksum(file, function(actual_checksum) {
                        input.file_call++;

                        expect(real_checksum)
                            .to.equal(actual_checksum);

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
});
