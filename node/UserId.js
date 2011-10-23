var UserId = function() {
}
  
UserId.prototype.run = function(future) {  
    console.log("Tailor/UserId: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/usr/bin/id -u";

    console.log("Tailor/UserId: Running command: "+cmd);

    exec(cmd, function(error, stdout, stderr) {
	    if (error !== null) { 
		error.errorCode = error.code;
		future.exception = error;
	    }
	    else {
		future.result = { userId: stdout.split('\n')[0] };
	    }
	});
}
