var ListMounts = function() {
};
  
ListMounts.prototype.run = function(future) {  
    console.log("Tailor/ListMounts: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "cat /proc/mounts";

    console.log("Tailor/ListMounts: Running command: "+cmd);

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
