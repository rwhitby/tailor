var UnmountOptware = function() {
};
  
UnmountOptware.prototype.run = function(future) {  
    console.log("Tailor/UnmountOptware: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/sbin/stop org.webosinternals.optware";

    console.log("Tailor/UnmountOptware: Running command: "+cmd);

    exec(cmd, function(error, stdout, stderr) {
	    if (error !== null) { 
		error.errorCode = error.code;
		future.exception = error;
	    }
	    else {
		future.result = { stdOut: stdout.split('\n').slice(0,-1) };
	    }
	});
};
