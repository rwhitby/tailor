var UnmountMedia = function() {
};
  
UnmountMedia.prototype.run = function(future) {  
    console.log("Tailor/UnmountMedia: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/usr/bin/pkill -SIGUSR1 cryptofs && /bin/umount /media/internal";

    console.log("Tailor/UnmountMedia: Running command: "+cmd);

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
