var MountLuneOS = function() {
};

MountLuneOS.prototype.run = function(future) {
    console.log("Tailor/MountLuneOS: Called by "+this.controller.message.applicationID().split(" ")[0]+
		" via "+this.controller.message.senderServiceName());

    var cmd = "/bin/mount /dev/store/luneos-root /media/luneos-root";

	var path = require("path");
	if (!path.existsSync("/media/luneos-root")) {
		var fs = require("fs");
		fs.mkdirSync("/media/luneos-root", 0777);
	}

    console.log("Tailor/MountLuneOS: Running command: "+cmd);

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
