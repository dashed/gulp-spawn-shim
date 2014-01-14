var
spawn = require('child_process').spawn,
path = require("path"),
fs = require('fs'),
domain = require('domain'),
// es = require('event-stream'),
events = require('events'),

tmp = require('tmp'),
_queue = require('async-queue-stream'),
gutil = require('gulp-util');
// through = require('through');

function gulp_spawn_shim(_opts) {

    var opts = _opts || {};

    if(!opts.cmd)
        throw new Error('Command for child_process.spawn is required');

    if(typeof opts.cmd !== 'string')
        throw new Error('Command for child_process.spawn must be a string');


    // Spawn args as defined in http://nodejs.org/api/child_process.html
    opts.cmd = _opts.cmd;
    opts.args = _opts.args || [];
    opts.options = _opts.options || void 0;

    // file name templates
    opts.template = _opts.template || {};
    opts.template.basename = _opts.template.basename || "<%= basename %>";
    opts.template.extname = _opts.template.extname || "<%= extname %>";
    opts.template.filename = _opts.template.filename || "<%= filename %>";

    // micro-template args
    var config_args = function(file) {

        // template the args
        var exp = {};
        exp.basename = path.basename(file.path);
        exp.extname = path.extname(exp.basename);
        exp.filename = path.basename(exp.basename, exp.extname);
        exp.file = file;

        opts.args = (opts.args).map(function(elem){
            return gutil.template(elem, exp);
        });

    };

    /**
     * Custom events for stream:
     * - stderr
     * - exit (exit code)
     *
     * TODO: merge them?
     */
    var super_bus = new events.EventEmitter();


    var _write = function(file, cb) {

        // pass along
        if (file.isNull()) return cb(null, file);

        var err_catcher = domain.create();

        /**
         * Available events:
         * publish
         */
        var bus = new events.EventEmitter();

        // properly invoke callback once
        bus.once('publish', function(err, _file) {
            if(err) {
                bus.removeAllListeners();
            }

            return cb(err, _file);
        });

        // micro-template args
        config_args(file);

        // handle stream error appropriately
        err_catcher.once('error', function(err) {

            // Broken pipe
            if (err.code == "EPIPE" || err.code == "ENOENT") {
                return bus.emit('publish');
            }
            // console.log('CAUGHT ERROR: ' + err);
            // console.log('FILE: ' + file.path);
            bus.emit('publish', err);
        });


        var child = spawn(opts.cmd, opts.args, opts.options);

        // attach streams to handle errors
        err_catcher.add(child);
        err_catcher.add(child.stdin);
        err_catcher.add(child.stdout);
        err_catcher.add(child.stderr);
        err_catcher.add(file.contents);


        // capture spawn.stderr
        var _stderr = '';

        child.stderr.on('data', function (data) {
            _stderr += data;
        }).on('end', function() {
            if(_stderr.length > 0)
                return super_bus.emit('stderr', _stderr);
        });

        // capture spawn exit code
        child.on('close', function(num) {
            return super_bus.emit('exit', num);
        });


        if (file.isStream()) {

            tmp.setGracefulCleanup();

            // 1. Create tmp file
            tmp.file(function _tempFileCreated(err, tmp_path, fd) {
                if (err) return bus.emit('publish', err);

                // Attempt to write to stdin

                file.contents
                    .pipe(child.stdin)
                    .once('error', function(err) {
                        return bus.emit('publish', err);
                    });


                var tmp_file = fs.createWriteStream(tmp_path);


                // child.stdout.pipe(tmp_file);


                var written_tmp = false;
                child.stdout
                    // 2. Attempt to write to tmp file
                    .on('data', function(data) {
                        tmp_file.write(data);
                        written_tmp = true;
                    })
                    // 3. Publish file when tmp file was written or not
                    .once('end', function() {
                        tmp_file.end();

                        if(written_tmp === false) {
                            return bus.emit('publish');
                        }

                        file.contents = fs.createReadStream(tmp_path);

                        // // REMOVE
                        // file.contents.on('end', function() {
                        //     console.log('closed tmp file:' + path.basename(file.path));
                        // });

                        return bus.emit('publish', void 0, file);
                    });
            });

            return;

        } else if (file.isBuffer()) {

            var output = new Buffer(0);

            child.stdout.on("data", function (chunk) {
                output = Buffer.concat([output, chunk]);
            });

            child.stdout.once("end", function () {
                    file.contents = output;
                    return bus.emit('publish', void 0, file);
            });

            child.stdin.write(file.contents);
            child.stdin.end();
            return;
        }

    };

    var stream = _queue(_write);

    super_bus.on('stderr', function(stderr) {
        stream.emit('stderr', stderr);
    });

    super_bus.on('exit', function(exit) {
        stream.emit('exit', exit);
    });

    return stream;
}

module.exports = gulp_spawn_shim.bind({});
