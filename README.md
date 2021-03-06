[gulp](https://github.com/gulpjs/gulp)-spawn-shim
===============

[![NPM version](https://badge.fury.io/js/gulp-spawn-shim.png)](http://badge.fury.io/js/gulp-spawn-shim)
[![Build Status](https://travis-ci.org/Dashed/gulp-spawn-shim.png?branch=master)](https://travis-ci.org/Dashed/gulp-spawn-shim)
[![Coverage Status](https://coveralls.io/repos/Dashed/gulp-spawn-shim/badge.png?branch=master)](https://coveralls.io/r/Dashed/gulp-spawn-shim?branch=master)
[![Dependency Status](https://david-dm.org/Dashed/gulp-spawn-shim.png)](https://david-dm.org/Dashed/gulp-spawn-shim)

Thin wrapper (shim) of Node.js's [child_process.spawn()](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) with respect to gulp (vinyl file streams) by binding to stdin, stdout, and stderr.

Supports both streaming and buffer modes (for vinyl) specified in the [gulp](https://github.com/gulpjs/gulp) plugin guidelines.

**Note:** Gulp stream objects known as [vinyl](https://github.com/wearefractal/vinyl) objects.

An alternative to this plugin is [gulp-spawn](https://github.com/hparra/gulp-spawn).


## Install

1. Install [Node.js](http://nodejs.org/)

2.  Run: `npm install gulp-spawn-shim`

## API

### gspawn(options [, callback])

### gspawn(callback)

#### Arguments

* `options` -- an object containing options for gulp-spawn-shim

* `callback` -- callback function with signature `function(file, opts, cb)`

   The callback function is invoked before `child_process.spawn(...)` is executed.

   The callback function is passed the file (vinyl object), and opts (a filtered object of the one passed to `spawn()`).

   If `options` is excluded, the callback function is passed an empty options objects from which you must populate. This is useful for when you want to dynamically execute different `child_process.spawn()` profiles on various files.

##### Options

[child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) parameters:

* `options.cmd` - ***(String)*** cmd parameter of [child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). **Required**

* `options.args` - ***(Array)*** args parameter of [child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). ***Default:*** Empty array

* `options.options` - ***(Object)*** options parameter of [child_process.spawn](nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options). ***Default:*** undefined

### Arg Templates

Available for args are placeholders made available for you to use. These placeholders...

* `<%= basename %>` - placeholder for file's basename (e.g. `quux.html`)

* `<%= extname %>` - placeholder for file's extension (e.g. `.html`)

* `<%= filename %>` - placeholder for file's filename (e.g. `quux`)

**Note:** Template placeholders are done via [gulp-util.template()](https://github.com/gulpjs/gulp-util), which itself uses [lodash templates](http://lodash.com/docs#template).


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
    .pipe(gulp.dest(...));
```

## Under the hood

1. As vinyl objects are passed to gulp-spawn-shim, contents of the file (e.g. `file.contents`) are piped to ***stdin*** of the child_process.spawn() instance.

2. Any ***stdout*** are piped back to `file.contents`.

   **Note:** If there is no ***stdout***, gulp-spawn-shim will not push the file to the next stream -- and thus the file will be **dropped silently**.

3. Any misc. events such as ***stderr*** and ***exit codes*** are emitted appropriately.


License
=======

MIT. See LICENSE.
