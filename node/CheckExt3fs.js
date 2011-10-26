var CheckExt3fs = function() {
};
  
CheckExt3fs.prototype.run = function(future, subscription) {  
    var args = this.controller.args;

    console.log("Tailor/CheckExt3fs: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var argv = ["/sbin/e2fsck", "-n", "-f", "-v", args.filesystem];

    console.log("Tailor/CheckExt3fs: Running command: "+argv.join(' '));

    var command = spawn(argv[0], argv.slice(1));

    console.log("Tailor/CheckExt3fs: Spawned child (pid "+command.pid+")");

    future.result = { stage: "start" };

    var stdOutData = "";
    command.stdout.setEncoding('utf8');
    command.stdout.on('data', function (data) {
	    console.log("Got stdout data");
	    if (stdOutData != "") {
		data = stdOutData + data;
		stdOutData = "";
	    }
	    var pos = data.lastIndexOf("\n");
	    if (pos == -1) {
		stdOutData = data;
	    }
	    else {
		var stdOutLines = data.split('\n');
		stdOutData = stdOutLines.pop();
		while (stdOutLines.length) {
		    var s = subscription.get();
		    console.log("Sent stdout status");
		    s.result = { stage: "status", stdOut: stdOutLines.shift() };
		}
	    }
	});

    var stdErrTotal = "";
    var stdErrData = "";
    command.stderr.setEncoding('utf8');
    command.stderr.on('data', function (data) {
	    console.log("Got stderr data");
	    stdErrTotal += data;
	    if (stdErrData != "") {
		data = stdErrData + data;
		stdErrData = "";
	    }
	    var pos = data.lastIndexOf("\n");
	    if (pos == -1) {
		stdErrData = data;
	    }
	    else {
		var stdErrLines = data.split('\n');
		stdErrData = stdErrLines.pop();
		while (stdErrLines.length) {
		    var s = subscription.get();
		    console.log("Sent stderr status");
		    s.result = { stage: "status", stdErr: stdErrLines.shift() };
		}
	    }
	});

    command.on('exit', function (code) {
	    var s = subscription.get();
	    if (stdOutData != "") {
		s.result = { stage: "status", stdOut: stdOutData };
		s = subscription.get();
	    }
	    if (stdErrData != "") {
		s.result = { stage: "status", stdErr: stdErrData };
		s = subscription.get();
	    }
	    if (code !== 0) {
		s.exception = { "errorCode": code, "message": "Command failed: "+stdErrTotal }
	    }
	    else {
		s.result = { stage: "end" };
	    }
	});
};
