var ListVolumes = function() {
};
  
ListVolumes.prototype.run = function(future) {  
    var args = this.controller.args;

    console.log("Tailor/ListVolumes: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/usr/sbin/lvm.static lvdisplay "+args.group+" -c";

    console.log("Tailor/ListVolumes: Running command: "+cmd);

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
