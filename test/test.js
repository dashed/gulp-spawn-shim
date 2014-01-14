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
es = require('event-stream'),
queue = require('async-queue-stream'),
through = require('through'),

// fixtures
shasum = void 0,

fixtures = path.join(__dirname, 'fixtures'),
rawFixtures = path.join(fixtures, 'raw/*.txt'),

actualFixtures = path.join(__dirname, 'fixtures/actual'),
actual = '_actual';

describe('gulp-spawn-shim', function() {

    describe("when given invalid params", function() {

        var opts, fn;

        beforeEach(function(){
            opts = {};

            fn = function() {
                spawn(opts);
            };
        });

        it("should throw error when given empty plain object for options", function() {
            // no given cmd
            expect(fn).to.throw(Error);
        });

        it("should throw error when given non-string cmd", function() {
            // given non-string cmd
            opts.cmd = [];
            expect(fn).to.throw(Error);
        });

        it("should not throw error when given string cmd", function() {
            // given a string cmd
            opts.cmd = 'no throwing';
            expect(fn).to.not.throw(Error);
        });

        it("should throw error when no opts given (i.e. undefined)", function() {
            // empty opts
            opts = void 0;
            expect(fn).to.throw(Error);
        });

    });



    // describe.only("when given source files in gulp stream mode,", function() {

    //     describe.only("with cmd that takes stdin and posts to stdout,", function() {
    //         it("should output correct file", function(done) {

    //             /**
    //              * Commands to test
    //              *
    //              * ./fixtures/stderr
    //              * false/true
    //              * sort
    //              */

    //             var opts = {};
    //             opts.cmd = 'sort';
    //             // opts.cmd = path.join(__dirname, opts.cmd);
    //             opts.args = [];
    //             opts.args.push('-k2');

    //             var call = 0;

    //             var check = queue(function(file, callback) {

    //                 get_actual_checksum(file, function(actual_checksum) {

    //                     var shasum_real = crypto.createHash('sha1');

    //                     file.contents.on('data', function(data) {
    //                         shasum_real.update(data);
    //                     }).once('end', function() {

    //                         call++;

    //                         expect(shasum_real.digest('hex'))
    //                             .to.equal(actual_checksum);
    //                         return callback();
    //                     });
    //                 });
    //             });

    //             gulp.src(rawFixtures, {buffer: false})
    //                 .pipe(spawn(opts))
    //                     // never expect error here
    //                     .on('failure', function(err) {
    //                         // console.log("FAILURE: " + err);
    //                         // done();
    //                     })
    //                     .on('stderr', function(stderr) {
    //                         // console.log('stderr: ' + stderr);
    //                     })
    //                     .on('exit', function(exit) {
    //                         // console.log('exit: <' + exit + '>');
    //                     })
    //                 .pipe(check)
    //                 .once('end', function() {
    //                     // console.log('DONE?!')
    //                     expect(call).to.equal(3);
    //                     done();
    //                 });
    //         });
    //     });

        // it("should output correct file in gulp buffer mode", function(done) {

        //     var opts = {};
        //     opts.cmd = 'sort';
        //     opts.args = [];
        //     opts.args.push('-k2');

        //     done();

        // });



        // it("should exit correctly for cmd that doesn't use stdout/stdin in gulp stream mode", function(done) {

        // });
    // });
});
