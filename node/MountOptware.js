var MountOptware = function() {
};
  
MountOptware.prototype.run = function(future) {  
    console.log("Tailor/MountOptware: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/sbin/start org.webosinternals.optware";

    console.log("Tailor/MountOptware: Running command: "+cmd);

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
