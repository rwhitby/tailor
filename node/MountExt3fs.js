var MountExt3fs = function() {
};
  
MountExt3fs.prototype.run = function(future) {  
    console.log("Tailor/MountExt3fs: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/bin/mount /media/ext3fs";

    console.log("Tailor/MountExt3fs: Running command: "+cmd);

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
