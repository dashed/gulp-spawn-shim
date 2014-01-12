var
spawn = require('child_process').spawn,
path = require("path"),
fs = require('fs'),
domain = require('domain'),
es = require('event-stream'),

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



    var _write = function(file, cb) {

        var err_catcher = domain.create();


        // pass along
        if (file.isNull()) return cb(null, file);

        config_args(file);

        err_catcher.once('error', function(err) {

            console.log('CAUGHT ERROR: ' + err);
            console.log('FILE: ' + file.path);
            return cb(err);
        });


        var child = void 0;
        child = spawn(opts.cmd, opts.args, opts.options);

        // catch a lot of errors
        err_catcher.add(child);
        err_catcher.add(child.stdin);
        err_catcher.add(child.stdout);
        err_catcher.add(child.stderr);
        err_catcher.add(file.contents);

        // error handling
        var err = '';

        child.stderr.on('data', function (data) {
            err += data;
        });

        var publish = function(f) {
            if(err.length <= 0) {
                err = null;
            } else {
                err = new Error(err);
            }

            return cb(err, f);
        };


        if (file.isStream()) {

            // really fucking lame


            // var stdout = es.pipeline(file.contents,
            //                         child.stdin,
            //                         child.stdout);

            file.contents.pipe(child.stdin);



            // file.contents = child.stdout;
            // return cb(null, file);

            // // stdout.on('data', function(data) {
            // //     file.contents.write(data);

            // // });


            tmp.file(function _tempFileCreated(err, tmp_path, fd) {
                if (err) err_catcher.emit('error', err);

                // console.log(Object.keys());
                if(child.stdout.readable === false) {
                    tmp.setGracefulCleanup();
                    // console.log('LOL')
                    // err_catcher.emit('error', new Error('not readable'));
                    return cb();
                }

                // read from tmp_file and write into it
                var tmp_file = fs.createWriteStream(tmp_path);

                child.stdout
                    .pipe(tmp_file);

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

    return _queue(_write);

}

module.exports = gulp_spawn_shim.bind({});
