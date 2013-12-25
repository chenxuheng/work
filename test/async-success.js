var AsyncJob = require("../lib/AsyncJob"),
    assert = require("assert"),
    l = console.log;

describe("async: simple success path", function(){

    var _job;

    function command(){
        var self = this,
            argCount = arguments.length;
        setTimeout(function(){ self.done(null, argCount); }, 10);
    }

    beforeEach(function(){
        _job = new AsyncJob({
            name: "test",
            command: command,
            args: [ 1,2,3,4 ]
        });
    });

    it("correct name", function(){
        assert.strictEqual(_job.name, "test");
    });

    it("correct state", function(done){
        assert.strictEqual(_job.state, _job.eState.idle);
        _job.run(function(){
            assert.strictEqual(_job.state, _job.eState.successful);
            done();
        });
        assert.strictEqual(_job.state, _job.eState.running);
    });

    it("correct return value", function(done){
        _job.run(function(err, ret){
            assert.strictEqual(ret, 4);
            done();
        });
    });

    it("correct events", function(done){
        var start, complete, success, fail;
        _job.on(_job.eEvent.start, function(){
            start = true;
        });
        _job.on(_job.eEvent.success, function(){
            success = true;
        });
        _job.on(_job.eEvent.fail, function(){
            fail = true;
        });
        _job.on(_job.eEvent.complete, function(){
            complete = true;
            assert.ok(start);
            assert.ok(success);
            assert.ok(!fail);
            assert.ok(complete);
            done();
        });
        _job.run();
    });
});
