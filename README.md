gulp-spawn-shim
=======================

[![Build Status](https://travis-ci.org/Dashed/gulp-spawn-shim.png?branch=v0.0.2)](https://travis-ci.org/Dashed/gulp-spawn-shim)
[![Coverage Status](https://coveralls.io/repos/Dashed/gulp-spawn-shim/badge.png?branch=master)](https://coveralls.io/r/Dashed/gulp-spawn-shim?branch=master)

Thin wrapper (shim) of Node.js's [child_process.spawn()](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) with respect to gulp (vinyl file streams) by binding to stdin, stdout, and stderr.

Supports both streaming and buffer modes (for vinyl) specified in the [gulp](https://github.com/gulpjs/gulp) plugin guidelines.

**Note:** Gulp stream objects known as [vinyl](https://github.com/wearefractal/vinyl) objects.

An alternative to this plugin is [gulp-spawn](https://github.com/hparra/gulp-spawn).


## Install

1. Install [Node.js](http://nodejs.org/)

2.  Run: `npm install gulp-spawn-shim`

## API

### gspawn(options)

**Arguments**

* `options` -- an object containing options for gulp-spawn-shim

[child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) parameters:

* `options.cmd` - ***(String)*** cmd parameter of [child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). **Required**

* `options.args` - ***(Array)*** args parameter of [child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). ***Default:*** Empty array

* `options.options` - ***(Object)*** options parameter of [child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). ***Default:*** undefined

args templates -- these are options to replace placeholder with file information in args (e.g. `cmd -o filename.pdf`):

* `opts.template` -- object containing args template info. ***Default:*** Object.

**Note:** Template placeholders are done via [gulp-util.template()](https://github.com/gulpjs/gulp-util), which itself uses [lodash templates](http://lodash.com/docs#template).

* `opts.basename` -- placeholder for file's basename. ***Default:*** `"<%= basename %>"`.

* `opts.extname` -- placeholder for file's extension name. ***Default:*** `"<%= extname %>"`.

* `opts.filename` -- placeholder for file's name. ***Default:*** `"<%= filename %>"`.

### Events

gulp-spawn-shim emit several events, some from the plugin itself, and other from child_process.spawn().

* `failure` -- Default error handler for internal plugin errors.

   Since this plugin uses [async-queue-stream](https://github.com/Dashed/async-queue-stream/) internally, the default error is `failure` instead of the standard stream `error` event. Therefore, **this plugin does not stop processing files when a file coerce a plugin error**.

   Handler signature: `.on('failure', function(err) {})`

* `stderr` -- stderr output from child_process.spawn(). stderr output is textual.

   Handler signature: `.on('stderr', function(stderr) {})`

* `exit` -- exit code from child_process.spawn(). exit code passed is a number.

   Handler signature: `.on('exit', function(exit) {})`

Usage
=====

```js
var
spawn = require('gulp-spawn-shim'),
opts = {};

opts.cmd = 'pandoc';
opts.args = ['-t', 'html'];

gulp.src('./notes/**/*.md')
    .pipe(spawn(opts))
    .pipe(gulp.desct(...));
```

## Under the hood

1. As vinyl objects are passed to gulp-spawn-shim, contents of the file (e.g. `file.contents`) are piped to ***stdin*** of the child_process.spawn() instance.

2. Any ***stdout*** are piped back to `file.contents`.

   **Note:** If there is no ***stdout***, gulp-spawn-shim will not push the file to the next stream -- and thus the file will be **dropped silently**.

3. Any misc. events such as ***stderr*** and ***exit codes*** are emitted appropriately.


License
=======

MIT. See LICENSE.
