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

    describe.only("when given source files with correct cmd", function() {

        var opts;

        // var get_actual_checksum = function(file, cb) {
        //     var
        //     basename = path.basename(file.path),
        //     extname = path.extname(basename),
        //     filename = path.basename(basename, extname);
        //     actual_filename = filename + actual + extname,
        //     actual_path = path.join(actualFixtures, actual_filename),

        //     shasum_actual = crypto.createHash('sha1');

        //     // get checksum of actual fixture
        //     fs.createReadStream(actual_path)
        //     .on('data', function(data) {
        //         shasum_actual.update(data);
        //     })
        //     .once('end', function() {
        //         cb(shasum_actual.digest('hex'));
        //     });
        // };

        // var compare_digest = function(d1, d2) {
        //     expect(d1 === d2).to.be.true;
        // }

        // var _process = function(buffer, opts, done) {
        //     gulp.src(rawFixtures, {buffer: true})
        //         .pipe(spawn(opts))
        //         .pipe(es.through(function(file){

        //             var shasum_processed = crypto.createHash('sha1');
        //             var shasum_actual = crypto.createHash('sha1');

        //             shasum_processed.update(file.contents);

        //             var actual_path = get_actual_path(file);

        //             // get checksum of actual fixture
        //             fs.createReadStream(actual_path)
        //             .on('data', function(data) {
        //                 shasum_actual.update(data);
        //             })
        //             .once('end', function() {

        //                 var d1 = shasum_actual.digest('hex');
        //                 var d2 = shasum_processed.digest('hex');
        //                 expect(d1 == d2).to.be.true;

        //             });
        //         }))
        //         .once('end', function(){
        //             done();
        //         });
        // };

        beforeEach(function() {

            shasum = crypto.createHash('sha1');
        });

        // it("should output correct file in gulp buffer mode", function(done) {

        //     var opts = {};
        //     opts.cmd = 'sort';
        //     opts.args = [];
        //     opts.args.push('-k2');

        //     done();

        // });

        it("should output correct file in gulp stream mode", function(done) {

            var opts = {};
            opts.cmd = 'sort';
            opts.args = [];
            opts.args.push('-k2 ');


            // process(true, opts, done);

            var check = queue(function(file, callback) {

                // if(!file)
                //     return cb();

                // console.log('queued: ' + path.basename(file.path));


                file.contents.on('data', function(data) {
                    console.log("read data: " + path.basename(file.path));

                }).once('end', function(){
                    console.log("done read data: " + path.basename(file.path));
                    callback();
                    // cb();
                }).on('error', function() {
                    console.log("ERRORRRR")
                });


                // console.log(data.path);

                // data.contents
                // .pipe(es.through(function() {
                //     // this.emit('data', data);

                //     // console.log(data.path);

                // }))
                // .on('close', function(){
                //     cb();
                // });

            });



            gulp.src(rawFixtures, {buffer: false})
                .pipe(spawn(opts))
                    // never expect error here
                    .once('failure', function() {
                        console.log("DURRR");
                        done();
                    })
                    // .on('failure', cleanup)
                    // .on('error', console.log)
                .pipe(check)
                .once('end', function() {
                    console.log('DONE?!')
                    done();
                });


        });
    });
});
