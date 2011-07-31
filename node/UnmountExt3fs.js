var UnmountExt3fs = function() {
};
  
UnmountExt3fs.prototype.run = function(future) {  
    console.log("Tailor/UnmountExt3fs: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/bin/umount /media/ext3fs";

    console.log("Tailor/UnmountExt3fs: Running command: "+cmd);

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
