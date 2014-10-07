var UnmountLuneOS = function() {
};

UnmountLuneOS.prototype.run = function(future) {
    console.log("Tailor/UnmountLuneOS: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/bin/umount /media/luneos-root";

    console.log("Tailor/UnmountLuneOS: Running command: "+cmd);

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
