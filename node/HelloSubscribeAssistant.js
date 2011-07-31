var spawn = require('child_process').spawn;

var HelloSubscribeAssistant = function() {
};
  
HelloSubscribeAssistant.prototype.run = function(future, subscription) {  
    var args = this.controller.args;

    console.log("HelloSubscribe: Hello " + this.controller.args.name + "!");
    console.log("HelloSubscribe: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var argv = ["echo", "Hello " + this.controller.args.name + "!"];

    console.log("HelloSubscribe: Running command: "+argv.join(' '));

    var command = spawn(argv[0], argv.slice(1));

    console.log("HelloSubscribe: Spawned child (pid "+command.pid+")");

    future.result = { stage: "start" };

    command.stdout.setEncoding('utf8');
    command.stdout.on('data', function (data) {
	    var s = subscription.get();
	    s.result = { stage: "middle", stdout: data };
	});

    var stderr = "";
    command.stderr.setEncoding('utf8');
    command.stderr.on('data', function (data) {
	    stderr += data;
	    var s = subscription.get();
	    s.result = { stage: "status", stderr: data };
	});

    command.on('exit', function (code) {
	    var s = subscription.get();
	    if (code !== 0) {
		var error = { "errorCode": code, "message": "Command failed: "+stderr }
		s.exception = error;
	    }
	    else {
		s.result = { stage: "end" };
	    }
	});
}
