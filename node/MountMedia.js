var MountMedia = function() {
};
  
MountMedia.prototype.run = function(future) {  
    console.log("Tailor/MountMedia: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/bin/mount /media/internal && /usr/bin/pkill -SIGUSR2 cryptofs";

    console.log("Tailor/MountMedia: Running command: "+cmd);

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
