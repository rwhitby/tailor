var UnmountBind = function() {
};
  
UnmountBind.prototype.run = function(future) {  
    var args = this.controller.args;

    console.log("Tailor/UnmountBind: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/bin/umount "+args.directory;

    console.log("Tailor/UnmountBind: Running command: "+cmd);

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
