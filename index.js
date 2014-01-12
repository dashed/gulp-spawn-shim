var
spawn = require('child_process').spawn,
path = require("path"),
fs = require('fs'),
domain = require('domain'),
es = require('event-stream'),
events = require('events'),

tmp = require('tmp'),
_queue = require('async-queue-stream'),
gutil = require('gulp-util'),
through = require('through');


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
    opts.template.filename = _opts.template.extname || "<%= filename %>";

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
     */
    var super_bus = new events.EventEmitter();

    //ENOENT

    var _write = function(file, cb) {

        // pass along
        if (file.isNull()) return cb(null, file);

        var err_catcher = domain.create();

        /**
         * Available events:
         *
         * publish
         *
         *
         * stdout-data
         * stdout-end
         * tmp-file-create
         * tmp-file-clean
         */
        var bus = new events.EventEmitter();

        // properly invoke callback once
        bus.once('publish', function(err, file) {
            if(err) {
                bus.removeAllListeners();
            }
            console.log('publish:' + path.basename(file.path));

            return cb(err, file);
        });


        config_args(file);

        // handle stream errors
        err_catcher.once('error', function(err) {

            // Broken pipe
            if (err.code == "EPIPE" || err.code == "ENOENT") {
                return bus.emit('publish');
            }
            console.log('CAUGHT ERROR: ' + err);
            console.log('FILE: ' + file.path);
            bus.emit('publish', err);
        });


        var child = void 0;
        child = spawn(opts.cmd, opts.args, opts.options);

        // catch a lot of errors
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


            /**
             * Available events:
             *
             * stdout-data
             * stdout-end
             * tmp-file-create
             * tmp-file-clean
             */

            bus.on('tmp-file-clean', function() {
                tmp.setGracefulCleanup();
            });

            // Attempt to write to stdin
            file.contents
                .pipe(child.stdin)

                // divert to domain
                .on('error', function() {})

                .on('finish', function() {
                    // console.log('ended!');
                });


            // 1. Create tmp file
            tmp.file(function _tempFileCreated(err, tmp_path, fd) {
                if (err) return bus.emit('publish', err);

                if(child.stdout.readable === false) {
                    return bus.emit('publish'), bus.emit('tmp-file-clean');
                }

                var tmp_file = fs.createWriteStream(tmp_path);

                // 2. Attempt to write to tmp file
                child.stdout.pipe(tmp_file);

                // tmp_file.on('end', function() {
                //     console.log('ended')
                // })

                var written_tmp = false;
                child.stdout
                    .once('readable', function() {
                        // bus.emit('tmp-file-create');
                    })
                    .once('data', function() {
                        written_tmp = true;
                        console.log("DID WRITE:" + path.basename(file.path));
                    })
                    .on('end', function() {

                        if(written_tmp === false) {

                            return bus.emit('publish');
                        }

                        file.contents = fs.createReadStream(tmp_path);

                        return bus.emit('publish', void 0, file);
                    });

            });



            return;

            // var readable = function(count, callback) {
            //     var self = this;
            // };

            // var writable = es.readable(readable);

            bus.on('stdout-end', function() {
                // writable.emit('end');
            });

            bus.on('tmp-file-create', function() {

                tmp.file(function _tempFileCreated(err, tmp_path, fd) {
                    if (err) return bus.emit('publish', err);

                    if(child.stdout.readable === false) {
                        return bus.emit('publish'), bus.emit('tmp-file-clean');
                    }

                    // write into tmp file
                    var tmp_file = fs.createWriteStream(tmp_path);
                    err_catcher.add(tmp_file);

                    child.stdout
                        .pipe(tmp_file);

                    child.stdout
                        .on('end', function() {

                            var read_stream = fs.createReadStream(tmp_path);

                            read_stream.on('end', function() {
                                tmp.setGracefulCleanup();
                                console.log('clean up: ' + path.basename(file.path));
                            });

                            file.contents = read_stream;

                            console.log('published: '+ path.basename(file.path));

                            return bus.emit('publish', void 0, file);

                        });

                });
            });



            return;


            tmp.file(function _tempFileCreated(err, tmp_path, fd) {
                if (err) err_catcher.emit('error', err);

                // console.log(Object.keys());
                if(child.stdout.readable === false) {
                    tmp.setGracefulCleanup();

                    // err_catcher.emit('error', new Error('not readable'));
                    return cb();
                }

                // read from tmp_file and write into it
                var tmp_file = fs.createWriteStream(tmp_path);

                child.stdout
                    .pipe(tmp_file);

                child.on('close', function(num) {
                    console.log(_stderr);

                    console.log('exit: ' + num);
                });

                child.stdout
                    .once('end', function(){

                        var read_stream = fs.createReadStream(tmp_path);

                        read_stream.on('end', function() {
                            tmp.setGracefulCleanup();
                            console.log('clean up: ' + path.basename(file.path));
                        });

                        file.contents = read_stream;

                        console.log('published: '+ file.path);
                        return cb(null, file);
                    });

            });





            return;

            // return publish(file);
            // return this.emit('error', new gutil.PluginError('gulp-pandoc', 'Streaming not supported.'));

        } else if (file.isBuffer()) {

            console.log('why are u here?')

            var output = new Buffer(0);

            child.stdout.on("data", function (chunk) {
                output = Buffer.concat([output, chunk]);
            });

            child.stdout.once("end", function () {
                    file.contents = output;
                    publish(file);
            });

            child.stdin.write(file.contents);
            child.stdin.end();

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
