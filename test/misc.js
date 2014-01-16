var
path = require('path'),

// gulp stuff
gulp = require('gulp'),
spawn = require('../')

// test
chai = require('chai'),
assert = chai.assert,
should = chai.should(),
expect = chai.expect,

// misc

queue = require('async-queue-stream'),
// through = require('through'),
helper = require('./helper');

describe("when given file.contents = null", function() {

    it("should pass the file", function(done) {

        var
        opts = {},
        null_calls = 0;

        opts.cmd = 'do nothing';

        gulp.src(helper.rawFixtures, {buffer: true})
            .pipe(queue(function(file, cb) {

                file.contents = null;

                return cb(null, file);
            }))
            .pipe(spawn(opts))
            .on('data', function(file) {
                if (file.contents === null)
                    null_calls++;
            })
            .on('end', function() {

                try {
                    expect(null_calls).to.equal(3);

                    done();
                } catch(err) {
                    done(err);
                }
            });

    });

});
