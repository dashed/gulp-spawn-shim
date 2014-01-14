var
// test
chai = require('chai'),
assert = chai.assert,
should = chai.should(),
expect = chai.expect,

// misc
spawn = require('../');

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

});
