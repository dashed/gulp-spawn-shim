var
// node.js
crypto = require('crypto'),
path = require('path'),
fs = require('fs'),
events = require('events'),

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


helper.process = function(input_obj, check_obj) {

    var
    bus = new events.EventEmitter(),

    // failure_call = 0,
    stderr_call = 0,
    exit_call = 0,

    done_calls = 0,
    threshold = 0;

    if(check_obj.exit_call !== void 0)
        threshold++;

    // if(check_obj.failure_call !== void 0)
    //     threshold++;

    if(check_obj.stderr_call)
        threshold++;

    // done event
    threshold++;


    gulp.src(input_obj.src, {buffer: input_obj.buffer})
        .pipe(spawn(input_obj.opts))
            .on('failure', function(err) {
                // failure_call++;

                // if(check_obj.failure_call !== void 0 && failure_call === check_obj.failure_call)
                //     bus.emit('done');
            })
            .on('stderr', function(stderr) {
                stderr_call++;

                if(check_obj.stderr_call && stderr_call === check_obj.stderr_call)
                    bus.emit('done');

            })
            .on('exit', function(exit) {

                if(check_obj.exit_code !== exit)
                    return bus.emit('done', new Error('unxpected exit code'));

                exit_call++;

                if(check_obj.exit_call)
                    if(exit_call === check_obj.exit_call)
                        bus.emit('done');

            })
        .pipe(input_obj.check)
        .once('end', function() {
            bus.emit('done');
        });


    bus.on('done', function(err) {
        if(err)
            return input_obj.done(err);

        // if we're truly done
        done_calls++;
        if(done_calls < threshold)
            return;

        helper.pass(input_obj.done, function() {

            if(check_obj.file_call)
                expect(input_obj.file_call).to.equal(check_obj.file_call);

            if(check_obj.exit_call)
                expect(exit_call).to.equal(check_obj.exit_call);

            // if(check_obj.failure_call)
            //     expect(failure_call).to.equal(check_obj.failure_call);

            if(check_obj.stderr_call)
                expect(stderr_call).to.equal(check_obj.stderr_call);
        });

    });
};

module.exports = helper;
