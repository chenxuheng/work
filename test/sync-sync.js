var SyncJob = require("../lib/SyncJob"),
    assert = require("assert"),
    l = console.log;

describe("sync > sync", function(){

    var _job, _child1;

    function command(){
        return arguments.length;
    }
    function brokenCommand(){
        throw new Error("broken");
        return arguments.length;
    }

    beforeEach(function(){
        _job = new SyncJob({
            name: "test",
            command: command,
            args: [ 1,2,3 ]
        });
        _brokenJob = new SyncJob({
            name: "test",
            command: brokenCommand,
            args: [ 1,2,3 ]
        });
        _runOnComplete = new SyncJob({
            name: "child1",
            runOn: "complete",
            command: command,
            args: 1
        });
        _runOnFail = new SyncJob({
            name: "child2",
            runOn: "fail",
            command: command,
            args: 1
        });
        _runOnSuccess = new SyncJob({
            name: "child3",
            runOn: "success",
            command: command,
            args: 1
        });
    });

    it("add three children", function(){
        _job.add(_runOnComplete);
        assert.strictEqual(_job.children.jobs.length, 1);
        _job.add(_runOnFail);
        assert.strictEqual(_job.children.jobs.length, 2);
        _job.add(_runOnSuccess);
        assert.strictEqual(_job.children.jobs.length, 3);
    });
    
    it("ignored state", function(){
        var runOnFailSucceeded, runOnFailIgnored;
        _job.add(_runOnFail);
        _runOnFail.on("success", function(){
            runOnFailSucceeded = true;
        });
        _runOnFail.on("ignore", function(){
            runOnFailIgnored = true;
        });
        _job.run();
        assert.strictEqual(_runOnFail.state, "ignored");
        assert.ok(!runOnFailSucceeded);
        assert.ok(runOnFailIgnored);
    });

    it("runOn 'complete' works", function(){
        var runOnCompleteRan = false, runOnFailRan = false, runOnSuccessRan = false;
        _job.add(_runOnComplete);
        _job.add(_runOnFail);
        _job.add(_runOnSuccess);
        _runOnComplete.on("success", function(){
            runOnCompleteRan = true;
        });
        _runOnFail.on("success", function(){
            runOnFailRan = true;
        });
        _runOnSuccess.on("success", function(){
            runOnSuccessRan = true;
        });
        _job.run();
        assert.ok(runOnCompleteRan);
        assert.ok(!runOnFailRan);
        assert.ok(runOnSuccessRan);
    });

    it("runOn 'fail' works", function(){
        var runOnCompleteRan = false, runOnFailRan = false, runOnSuccessRan = false;
        _brokenJob.add(_runOnComplete);
        _brokenJob.add(_runOnFail);
        _brokenJob.add(_runOnSuccess);
        _runOnComplete.on("success", function(){
            runOnCompleteRan = true;
        });
        _runOnFail.on("success", function(){
            runOnFailRan = true;
        });
        _runOnSuccess.on("success", function(){
            runOnSuccessRan = true;
        });
        _brokenJob.run();
        assert.ok(runOnCompleteRan);
        assert.ok(runOnFailRan);
        assert.ok(!runOnSuccessRan);
    });

    it("runOn 'success' works", function(){
        var runOnCompleteRan = false, runOnFailRan = false, runOnSuccessRan = false;
        _job.add(_runOnComplete);
        _job.add(_runOnFail);
        _job.add(_runOnSuccess);
        _runOnComplete.on("success", function(){
            runOnCompleteRan = true;
        });
        _runOnFail.on("success", function(){
            runOnFailRan = true;
        });
        _runOnSuccess.on("success", function(){
            runOnSuccessRan = true;
        });
        _job.run();
        assert.ok(runOnCompleteRan);
        assert.ok(!runOnFailRan);
        assert.ok(runOnSuccessRan);
    });
    
    it("queue runs correctly", function(){
        var result = [];
        function concat(msg){
            result.push(msg)
        }
        function createJob(msg){
            return new SyncJob({
                name: "job",
                command: concat,
                args: msg
            });
        }

        var queue = new SyncJob({ name: "queue" });
        queue.add(createJob("clive"));
        queue.add(createJob("hater"));
        queue.add(createJob("nigeria"));
        queue.run();
        assert.strictEqual(result.toString(), "clive,hater,nigeria");
    });
});
