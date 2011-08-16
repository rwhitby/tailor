var ListGroups = function() {
};
  
ListGroups.prototype.run = function(future) {  
    console.log("Tailor/ListGroups: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/usr/sbin/lvm.static vgdisplay -c";

    console.log("Tailor/ListGroups: Running command: "+cmd);

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
