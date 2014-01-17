var
path = require('path'),
events = require('events'),

// gulp stuff
gulp = require('gulp'),
spawn = require('../'),

// test
chai = require('chai'),
assert = chai.assert,
should = chai.should(),
expect = chai.expect,

// misc

queue = require('async-queue-stream'),
// through = require('through'),
helper = require('./helper');

describe.only('when callback is used,', function() {

    describe('passed with opts object,', function() {

        it("should emit failure event on invalid opts params (buffer mode),", function(done) {

            this.timeout(4000);

            var
            opts = {},
            cb_calls = 0,
            pipe_calls = 0,
            fail_calls = 0;

            opts.cmd = 'very broken command';
            opts.args = [];
            opts.args.push("s/a/b/g");

            var magic = function(file, opts, cb) {

                // tag
                file.tag = 'tagged';

                cb_calls++;

                return cb(file, opts);
            };

            var cleanup = function() {

                try{
                    expect(cb_calls).to.equal(3);
                    expect(fail_calls).to.be.at.least(1);
                    expect(pipe_calls).to.equal(0);

                    done();
                } catch(err) {
                    return done(err);
                }

            };

            var fail = function() {
                console.log('failed');
                fail_calls++;
            };

            // pass options with function - buffer mode
            gulp.src(helper.rawFixtures, {buffer: true})
                .pipe(spawn(opts, magic))
                    .on('failure', fail)

                // this should never be executed!!
                .pipe(queue(function(file, cb) {

                    console.log('not supposed to be here');

                    pipe_calls++;
                    return cb();
                }))
                .on('end', cleanup);

        });

        it("should pass tagged file object as is (buffer mode),", function(done) {

            var
            opts = {},
            cb_calls = 0,
            sum_calls = 0;

            opts.cmd = 'sed';
            opts.args = [];
            opts.args.push("s/a/b/g");

            var magic = function(file, opts, cb) {

                // tag
                file.tag = 'tagged';

                cb_calls++;

                return cb(file, opts);
            };

            var cleanup = function() {

                try{
                    expect(cb_calls).to.equal(3);
                    expect(sum_calls).to.equal(3);

                    done();
                } catch(err) {
                    return done(err);
                }
            };

            // pass options with function - buffer mode
            gulp.src(helper.rawFixtures, {buffer: true})
                .pipe(spawn(opts, magic))
                .pipe(queue(function(file, cb) {

                    // ensure file is transformed via child_process.spawn(...)
                    helper.get_actual_checksum(file, function(actual_checksum) {
                        helper.get_buffer_checksum(file.contents, function(real_checksum) {
                            // console.log(actual_checksum);
                            // console.log(checksum + "\n");
                            try {
                                expect(real_checksum)
                                    .to.equal(actual_checksum);

                                sum_calls++;
                            } catch(err) {
                                done(err);
                            }
                            return cb();
                        });
                    });
                    // console.log(file.tag);
                    try {
                        expect(file.tag).to.deep.equal('tagged');
                    } catch(err) {
                        done(err);
                    }

                }))
                .on('end', cleanup);


        });

        it("should emit failure event on invalid opts params (stream mode),", function(done) {

            this.timeout(0);

            var
            bus = new events.EventEmitter(),
            opts = {},
            cb_calls = 0,
            pipe_calls = 0,
            fail_calls = 0;

            opts.cmd = 'very broken command';
            opts.args = [];
            opts.args.push("s/a/b/g");



            var magic = function(file, opts, cb) {

                // tag
                file.tag = 'tagged';

                cb_calls++;

                return cb(file, opts);
            };

            var count = 0;
            bus.on('done', function(err) {

                count++;
                if(count < 4) {
                    return;
                }


                try{
                    expect(cb_calls).to.equal(3);
                    expect(fail_calls).to.be.at.least(1);
                    expect(pipe_calls).to.equal(0);

                    done();
                } catch(err) {
                    return done(err);
                }


            });

            var fail = function(err) {
                fail_calls++;
                bus.emit('done');
            };

            // pass options with function - stream mode
            gulp.src(helper.rawFixtures, {buffer: false})
                .pipe(spawn(opts, magic))
                    .on('failure', fail)

                // this should never be executed!!
                .pipe(queue(function(file, cb) {

                    pipe_calls++;

                    console.log('not supposed to be here2');

                    file.contents.end();

                    return cb(null, file);
                }))
                .on('end', function() {
                    bus.emit('done');
                });

        });

        it("should pass tagged file object as is (stream mode),", function(done) {

            var
            opts = {},
            cb_calls = 0,
            sum_calls = 0;

            opts.cmd = 'sed';
            opts.args = [];
            opts.args.push("s/a/b/g");

            var magic = function(file, opts, cb) {

                // tag
                file.tag = 'tagged';

                cb_calls++;

                return cb(file, opts);
            };

            var cleanup = function() {

                try{
                    expect(cb_calls).to.equal(3);
                    expect(sum_calls).to.equal(3);

                    done();

                } catch(err) {
                    return done(err);
                }
            };

            // pass options with function - stream mode
            gulp.src(helper.rawFixtures, {buffer: false})
                .pipe(spawn(opts, magic))
                .pipe(queue(function(file, cb) {

                    // ensure file is transformed via child_process.spawn(...)
                    helper.get_actual_checksum(file, function(actual_checksum) {
                        helper.get_stream_checksum(file.contents, function(real_checksum) {
                            // console.log(actual_checksum);
                            // console.log(checksum + "\n");
                            try {
                                expect(real_checksum)
                                    .to.equal(actual_checksum);

                                sum_calls++;
                            } catch(err) {
                                done(err);
                            }
                            return cb();
                        });
                    });
                    // console.log(file.tag);
                    try {
                        expect(file.tag).to.deep.equal('tagged');
                    } catch(err) {
                        done(err);
                    }

                }))
                .on('end', cleanup);


        });
    });

    describe('passed with no opts object,', function() {

        it("should emit failure event on invalid opts params (buffer mode),", function(done) {

            var
            opts = {},
            cb_calls = 0,
            pipe_calls = 0,
            fail_calls = 0;

            opts.cmd = 'very broken command';
            opts.args = [];
            opts.args.push("s/a/b/g");

            var magic = function(file, opts, cb) {

                // tag
                file.tag = 'tagged';

                cb_calls++;

                return cb(file, opts);
            };

            var cleanup = function() {

                try{
                    expect(cb_calls).to.equal(3);
                    expect(fail_calls).to.equal(3);
                    expect(pipe_calls).to.equal(0);

                    done();
                } catch(err) {
                    return done(err);
                }


            };

            var fail = function() {
                fail_calls++;
            };

            // pass options with function - buffer mode
            gulp.src(helper.rawFixtures, {buffer: true})
                .pipe(spawn(magic))
                    .on('failure', fail)

                // this should never be executed!!
                .pipe(queue(function(file, cb) {

                    pipe_calls++;

                    // console.log(file.tag);
                    try {
                        expect(file.tag).to.deep.equal('tagged');
                    } catch(err) {
                        done(err);
                    }

                }))
                .on('end', cleanup);

        });

        it("should emit failure event on invalid opts params (stream mode),", function(done) {

            var
            cb_calls = 0,
            sum_calls = 0,
            pipe_calls = 0,
            fail_calls = 0;


            var magic = function(file, opts, cb) {

                // tag
                file.tag = 'tagged';

                opts.cmd = [1];

                cb_calls++;

                return cb(file, opts);
            };

            var cleanup = function() {

                try{
                    expect(cb_calls).to.equal(3);
                    expect(fail_calls).to.equal(3);
                    expect(sum_calls).to.equal(0);
                    expect(pipe_calls).to.equal(0);

                    done();
                } catch(err) {
                    return done(err);
                }


            };

            var fail = function() {
                fail_calls++;
            };

            // pass options with function - stream mode
            gulp.src(helper.rawFixtures, {buffer: false})
                .pipe(spawn(magic))
                    .on('failure', fail)

                // this should never be executed!!
                .pipe(queue(function(file, cb) {

                    pipe_calls++;

                    // ensure file is transformed via child_process.spawn(...)
                    helper.get_actual_checksum(file, function(actual_checksum) {
                        helper.get_stream_checksum(file.contents, function(real_checksum) {
                            // console.log(actual_checksum);
                            // console.log(checksum + "\n");
                            try {
                                expect(real_checksum)
                                    .to.equal(actual_checksum);

                                sum_calls++;
                            } catch(err) {
                                done(err);
                            }
                            return cb();
                        });
                    });
                    // console.log(file.tag);
                    try {
                        expect(file.tag).to.deep.equal('tagged');
                    } catch(err) {
                        done(err);
                    }

                }))
                .on('end', cleanup);

        });

        it("should pass tagged file object as is (buffer mode),", function(done) {

            var
            cb_calls = 0,
            sum_calls = 0;

            var magic2 = function(file, opts, cb) {

                opts.cmd = 'sed';
                opts.args = [];
                opts.args.push("s/a/b/g");

                // tag
                file.tag = 'tagged';

                cb_calls++;

                return cb(file, opts);
            };

            var cleanup = function() {

                try{
                    expect(cb_calls).to.equal(3);
                    expect(sum_calls).to.equal(3);

                    done();

                } catch(err) {
                    return done(err);
                }

            };

            // pass only function - buffer mode
            gulp.src(helper.rawFixtures, {buffer: true})
                .pipe(spawn(magic2))
                    .on('failure', done)
                .pipe(queue(function(file, cb) {

                    // ensure checksum passes
                    helper.get_actual_checksum(file, function(actual_checksum) {
                        helper.get_buffer_checksum(file.contents, function(real_checksum) {
                            // console.log(actual_checksum);
                            // console.log(checksum + "\n");

                            try {
                                expect(real_checksum)
                                    .to.equal(actual_checksum);

                                sum_calls++;

                            } catch(err) {
                                done(err);
                            }

                            return cb();
                        });
                    });

                    // ensure file is tagged properly
                    try {
                        expect(file.tag).to.deep.equal('tagged');
                    } catch(err) {
                        done(err);
                    }

                }))
                .on('end', cleanup);

        });

        it("should pass tagged file object as is (stream mode),", function(done) {

            var
            cb_calls = 0,
            sum_calls = 0;

            var magic2 = function(file, opts, cb) {

                opts.cmd = 'sed';
                opts.args = [];
                opts.args.push("s/a/b/g");

                // tag
                file.tag = 'tagged';

                cb_calls++;

                return cb(file, opts);
            };

            var cleanup = function() {

                try{
                    expect(cb_calls).to.equal(3);
                    expect(sum_calls).to.equal(3);

                    done();

                } catch(err) {
                    return done(err);
                }

            };

            // pass only function - stream mode
            gulp.src(helper.rawFixtures, {buffer: false})
                .pipe(spawn(magic2))
                    .on('failure', done)
                .pipe(queue(function(file, cb) {

                    // ensure checksum passes
                    helper.get_actual_checksum(file, function(actual_checksum) {
                        helper.get_stream_checksum(file.contents, function(real_checksum) {
                            // console.log(actual_checksum);
                            // console.log(checksum + "\n");

                            try {
                                expect(real_checksum)
                                    .to.equal(actual_checksum);

                                sum_calls++;
                            } catch(err) {
                                done(err);
                            }

                            return cb();
                        });
                    });

                    // ensure file is tagged properly
                    try {
                        expect(file.tag).to.deep.equal('tagged');
                    } catch(err) {
                        done(err);
                    }

                }))
                .on('end', cleanup);

        });
    });


});
