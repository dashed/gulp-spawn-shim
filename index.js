var
spawn = require('child_process').spawn,
path = require("path"),

_queue = require('async-queue-stream'),
gutil = require('gulp-util');


function gulp_spawn_shim(_opts) {

    if(!_opts.cmd)
        throw new Error('Command for child_process.spawn is required');

    if(typeof _opts.cmd !== 'string')
        throw new Error('Command for child_process.spawn must be a string');

    var opts = _opts || {};

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

        config_args(file);

        var child = spawn(opts.cmd, opts.args, opts.options);

        // pass along
        if (file.isNull()) return cb(null, file);

        // error handling
        var err = '';

        child.stderr.on('data', function (data) {
            err += data;
        });

        var publish = function(file) {
            if(err.length <= 0)
                err = null;

            return cb(err, file);
        };

        if (file.isStream()) {

            var es = require('event-stream');

            file.contents = es.pipeline(file.contents,
                                        child.stdin,
                                        child.stdout);

            // Emit error
            child.stderr.once('end', function () {
                if(err)
                    file.contents.emit('error', new Error(err));
            });

            return publish(file);
            // return this.emit('error', new gutil.PluginError('gulp-pandoc', 'Streaming not supported.'));

        } else if (file.isBuffer()) {

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
