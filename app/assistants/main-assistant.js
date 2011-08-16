function MainAssistant()
{
	// subtitle random list
	this.randomSub =
		[
		 {weight: 30, text: $L('Tailoring the storage on your device')},
		 {weight: 10, text: $L('Formerly known as Resizah')},
		 {weight: 6, text: $L("<a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4DRCMPBJ8VYQQ\">Donated</a> To WebOS Internals Lately?")}
		 ];
	
	// setup menu
	this.menuModel = {
		visible: true,
		items: [
	{
		label: $L("Refresh"),
		command: 'do-refresh'
	},
	{
		label: $L("Preferences"),
		command: 'do-prefs'
	},
	{
		label: $L("Help"),
		command: 'do-help'
	}
				]
	};

	// setup volumes model
	this.volumesModel = {items:[]};
	
	this.newNameModel = { choices: [], disabled: true };

	this.newValueModel = { disabled: true };

	this.checkFilesystemButtonModel = {
		label: $L("Check Partition"),
		disabled: true
	};

	this.unmountFilesystemButtonModel = {
		label: $L("Unmount Filesystem"),
		disabled: true
	};

	this.resizeFilesystemButtonModel = {
		label: $L("Resize Filesystem"),
		disabled: true
	};

	this.resizePartitionButtonModel = {
		label: $L("Resize Partition"),
		disabled: true
	};

	this.mountFilesystemButtonModel = {
		label: $L("Mount Filesystem"),
		disabled: true
	};

	// setup mounts model
	this.mountsModel = {items:[]};
	
	this.mediaMountButtonModel = {
		label: $L("Unmount Media"),
		disabled: true
	};

	this.ext3fsMountButtonModel = {
		label: $L("Unmount Ext3fs"),
		disabled: true
	};

	this.optwareMountButtonModel = {
		label: $L("Unmount Optware"),
		disabled: true
	};

	this.totalSpace = 0;
	this.freeSpace = 0;
	this.peSize = 0;
	this.targetPartition = false;

	this.partitionNames = {
		"media":"USB (media)",
		"swap":"Swap",
		"ext3fs":"User (ext3)",
		"foo":"Foo (foo)"
	};

	this.mountNames = {
		"/dev/mapper/store-media":"USB (media)",
		"/dev/mapper/store-ext3fs":"User (ext3)"
	};

	this.partitionSizes = false;
	this.mountPoints = false;

	this.rebootRequired = false;

	this.timer = false;
	this.heartbeatValue = "*";

};

MainAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =		this.controller.get('icon');
	this.titleElement =		this.controller.get('main-title');
	this.versionElement =	this.controller.get('version');
	this.heartbeatElement =	this.controller.get('heartbeat');
	this.subTitleElement =	this.controller.get('subTitle');

	this.overlay = 			this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = 	this.controller.get('spinner');

	this.volumeList =		this.controller.get('volumeList');

	this.freeSpaceValue =	this.controller.get('freeSpaceValue');
	this.newNameList =		this.controller.get('newNameList');
	this.newValueLabel =	this.controller.get('newValueLabel');
	this.newValueField =	this.controller.get('newValueField');

	this.unmountFilesystemButton = this.controller.get('unmountFilesystemButton');
	this.checkFilesystemButton =   this.controller.get('checkFilesystemButton');
	this.resizeFilesystemButton =  this.controller.get('resizeFilesystemButton');
	this.resizePartitionButton =   this.controller.get('resizePartitionButton');
	this.mountFilesystemButton =   this.controller.get('mountFilesystemButton');

	this.mediaMountButton  = this.controller.get('mediaMountButton');
	this.ext3fsMountButton = this.controller.get('ext3fsMountButton');
	this.optwareMountButton = this.controller.get('optwareMountButton');

	this.statusTitle = 		this.controller.get('statusTitle');
	this.status = 			this.controller.get('status');
	
	this.mountList =		this.controller.get('mountList');

	// set version string random subtitle
	this.titleElement.innerHTML = Mojo.Controller.appInfo.title;
	this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
	this.heartbeatElement.innerHTML = this.heartbeatValue;
	this.subTitleElement.innerHTML = this.getRandomSubTitle();
	
	// setup handlers
	this.listGroupsHandler = this.listGroups.bindAsEventListener(this);
	this.listVolumesHandler = this.listVolumes.bindAsEventListener(this);
	this.volumeTappedHandler = this.volumeTapped.bindAsEventListener(this);
	this.newNameChangedHandler =  this.newNameChanged.bindAsEventListener(this);
	this.newValueChangedHandler =  this.newValueChanged.bindAsEventListener(this);
	this.unmountFilesystemTapHandler = this.unmountFilesystemTap.bindAsEventListener(this);
	this.unmountFilesystemHandler = this.unmountFilesystem.bindAsEventListener(this);
	this.checkFilesystemTapHandler = this.checkFilesystemTap.bindAsEventListener(this);
	this.checkFilesystemHandler = this.checkFilesystem.bindAsEventListener(this);
	this.resizeFilesystemTapHandler = this.resizeFilesystemTap.bindAsEventListener(this);
	this.resizePartitionTapHandler = this.resizePartitionTap.bindAsEventListener(this);
	this.mountFilesystemTapHandler = this.mountFilesystemTap.bindAsEventListener(this);
	this.mountFilesystemHandler = this.mountFilesystem.bindAsEventListener(this);
	this.listMountsHandler = this.listMounts.bindAsEventListener(this);
	this.mediaMountTapHandler = this.mediaMountTap.bindAsEventListener(this);
	this.mediaMountHandler = this.mediaMount.bindAsEventListener(this);
	this.ext3fsMountTapHandler = this.ext3fsMountTap.bindAsEventListener(this);
	this.ext3fsMountHandler = this.ext3fsMount.bindAsEventListener(this);
	this.optwareMountTapHandler = this.optwareMountTap.bindAsEventListener(this);
	this.optwareMountHandler = this.optwareMount.bindAsEventListener(this);

	// setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);

    this.controller.setupWidget('volumeList', {
			itemTemplate: "main/rowTemplate", swipeToDelete: false, reorderable: false }, this.volumesModel);
	this.controller.listen(this.volumeList, Mojo.Event.listTap, this.volumeTappedHandler);

	this.controller.setupWidget('newNameList', { label: "Partition" }, this.newNameModel);
	this.controller.listen(this.newNameList, Mojo.Event.propertyChange, this.newNameChangedHandler);
	this.controller.setupWidget('newValueField', {
			autoFocus: false,
				autoReplace: false,
				// hintText: 'Enter new partition size ...',
				multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				maxLength: 6,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				modifierState: Mojo.Widget.numLock,
				charsAllow: this.onlyNumbers.bind(this)
				},
		this.newValueModel);
	this.controller.listen(this.newValueField, Mojo.Event.propertyChange, this.newValueChangedHandler);
	this.controller.setupWidget('unmountFilesystemButton', { type: Mojo.Widget.activityButton }, this.unmountFilesystemButtonModel);
	this.controller.listen(this.unmountFilesystemButton, Mojo.Event.tap, this.unmountFilesystemTapHandler);
	this.controller.setupWidget('checkFilesystemButton', { type: Mojo.Widget.activityButton }, this.checkFilesystemButtonModel);
	this.controller.listen(this.checkFilesystemButton, Mojo.Event.tap, this.checkFilesystemTapHandler);
	this.controller.setupWidget('resizeFilesystemButton', { type: Mojo.Widget.activityButton }, this.resizeFilesystemButtonModel);
	this.controller.listen(this.resizeFilesystemButton, Mojo.Event.tap, this.resizeFilesystemTapHandler);
	this.controller.setupWidget('resizePartitionButton', { type: Mojo.Widget.activityButton }, this.resizePartitionButtonModel);
	this.controller.listen(this.resizePartitionButton, Mojo.Event.tap, this.resizePartitionTapHandler);
	this.controller.setupWidget('mountFilesystemButton', { type: Mojo.Widget.activityButton }, this.mountFilesystemButtonModel);
	this.controller.listen(this.mountFilesystemButton, Mojo.Event.tap, this.mountFilesystemTapHandler);
	this.controller.setupWidget('mediaMountButton', { type: Mojo.Widget.activityButton }, this.mediaMountButtonModel);
	this.controller.listen(this.mediaMountButton, Mojo.Event.tap, this.mediaMountTapHandler);
	this.controller.setupWidget('ext3fsMountButton', { type: Mojo.Widget.activityButton }, this.ext3fsMountButtonModel);
	this.controller.listen(this.ext3fsMountButton, Mojo.Event.tap, this.ext3fsMountTapHandler);
	this.controller.setupWidget('optwareMountButton', { type: Mojo.Widget.activityButton }, this.optwareMountButtonModel);
	this.controller.listen(this.optwareMountButton, Mojo.Event.tap, this.optwareMountTapHandler);

    this.controller.setupWidget('mountList', {
			itemTemplate: "main/rowTemplate", swipeToDelete: false, reorderable: false }, this.mountsModel);
};

MainAssistant.prototype.activate = function()
{
	this.timer = this.controller.window.setInterval(this.heartbeatTick.bind(this), 5000);
	this.refresh();
};

MainAssistant.prototype.deactivate = function()
{
	this.controller.window.clearInterval(this.timer);
};

MainAssistant.prototype.heartbeatTick = function()
{
	if (this.heartbeatValue == "*") {
		this.heartbeatValue = " ";
	}
	else {
		this.heartbeatValue = "*";
	}
	this.heartbeatRequest = TailorService.status(this.heartbeatTock.bind(this));
};	

MainAssistant.prototype.heartbeatTock = function()
{
	this.heartbeatElement.innerHTML = this.heartbeatValue;
};	

MainAssistant.prototype.refresh = function()
{
	this.overlay.show();
	this.partitionSizes = {
		"media":"0",
		"swap":"0",
		"ext3fs":"0",
		"foo":"0"
	};
	this.volumesModel.items = [];
	this.statusTitle.innerHTML = "Partition Status";
	this.status.innerHTML = "Reading partition sizes ...";
	this.newNameModel.disabled = true;
	this.controller.modelChanged(this.newNameModel);
	this.newValueModel.disabled = true;
	this.controller.modelChanged(this.newValueModel);
	this.unmountFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.unmountFilesystemButtonModel);
	this.checkFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.checkFilesystemButtonModel);
	this.resizeFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.resizeFilesystemButtonModel);
	this.resizePartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.resizePartitionButtonModel);
	this.mountFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.mountFilesystemButtonModel);
	this.mountPoints = {
		"/media/internal": false,
		"/opt": false,
		"/media/ext3fs": false
	}
	this.mountsModel.items = [];
	this.mediaMountButtonModel.disabled = true;
	this.controller.modelChanged(this.mediaMountButtonModel);
	this.ext3fsMountButtonModel.disabled = true;
	this.controller.modelChanged(this.ext3fsMountButtonModel);
	this.optwareMountButtonModel.disabled = true;
	this.controller.modelChanged(this.optwareMountButtonModel);
	this.request = TailorService.listGroups(this.listGroupsHandler);
};

MainAssistant.prototype.listGroups = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		payload.stdOut = [ "store:::::::::::15507456:8192:::111:" ]
	}

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listGroups):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
		return;
	}

	if (payload.stdOut && payload.stdOut.length > 0) {
		for (var a = 0; a < payload.stdOut.length; a++) {
			var line = payload.stdOut[a];
			var fields = line.split(":");
			if (fields.length == 17) {
				this.totalSpace = fields[11];
				this.peSize = fields[12] / 1024;
				this.freeSpace = fields[15] * this.peSize;
			}
		}
	}

	this.request = TailorService.listVolumes(this.listVolumesHandler, "store");
};

MainAssistant.prototype.listVolumes = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		payload.returnValue = true;
		payload.stdOut = [
						  "/dev/store/media:::::::1408:::::",
						  "/dev/store/swap:::::::13:::::",
						  "/dev/store/ext3fs:::::::256:::::",
						  ];
	}

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listVolumes):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
		return;
	}

	if (payload.stdOut && payload.stdOut.length > 0) {
		for (var a = 0; a < payload.stdOut.length; a++) {
			var line = payload.stdOut[a];
			var fields = line.split(":");
			if (fields.length == 13) {
				var size = fields[7] * this.peSize;
				var name = trim(fields[0]).split("/")[3];
				if (this.partitionNames[name]) {
					this.partitionSizes[name] = size;
					this.volumesModel.items.push({label: this.partitionNames[name]+":", title: this.showValue(size, "MiB"), name: name, labelClass: 'left', titleClass: 'right'});
				}
			}
		}
	}

	this.volumeList.mojo.noticeUpdatedItems(0, this.volumesModel.items);
	this.volumeList.mojo.setLength(this.volumesModel.items.length);

	this.newNameModel.choices = [];
	for (var f in this.partitionSizes) {
		this.newNameModel.choices.push({"label":this.partitionNames[f], "value":f});
	}
	this.newNameModel.value = this.newNameModel.choices[0].label;
	this.newNameModel.disabled = false;
	this.controller.modelChanged(this.newNameModel);

	this.checkFilesystemButtonModel.disabled = false;
	this.controller.modelChanged(this.checkFilesystemButtonModel);

	this.newNameChanged({value:this.newNameModel.choices[0].value});

	this.request = TailorService.listMounts(this.listMountsHandler);
};

MainAssistant.prototype.listMounts = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listMounts):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
		return;
	}

	if (this.partitionSizes["media"]) {
		this.mediaMountButtonModel.label = $L("Mount Media");
		this.mediaMountButtonModel.disabled = false;
		this.controller.modelChanged(this.mediaMountButtonModel);
	}

	if (this.partitionSizes["ext3fs"]) {
		this.ext3fsMountButtonModel.label = $L("Mount Ext3fs");
		this.ext3fsMountButtonModel.disabled = false;
		this.controller.modelChanged(this.ext3fsMountButtonModel);
	}

	if (this.partitionSizes["ext3fs"]) {
		this.optwareMountButtonModel.label = $L("Mount Optware");
		this.optwareMountButtonModel.disabled = false;
		this.controller.modelChanged(this.optwareMountButtonModel);
	}

	var jailActive = false;

	if (payload.stdOut && payload.stdOut.length > 0) {
		for (var a = 0; a < payload.stdOut.length; a++) {
			var line = payload.stdOut[a];
			var fields = line.split(" ");
			if (fields.length == 6) {
				var mountSource = trim(fields[0]);
				var mountPoint = trim(fields[1]);
				var mountType = trim(fields[2]);
				if ((mountType == "ext3") || (mountType == "vfat")) {
					if (this.mountNames[mountSource]) {
						this.mountsModel.items.push({label: this.mountNames[mountSource], title: mountPoint, labelClass: 'left', titleClass: 'right'});
						if (mountPoint.indexOf("/var/palm/jail/") != -1) {
							jailActive = true;
						}
					}
					if ((mountPoint == "/media/internal") && this.partitionSizes["media"]) {
						this.mountPoints[mountPoint] = mountSource;
						this.mediaMountButtonModel.label = $L("Unmount Media");
						this.mediaMountButtonModel.disabled = false;
						this.controller.modelChanged(this.mediaMountButtonModel);
					}
					if ((mountPoint == "/media/ext3fs") && this.partitionSizes["ext3fs"]) {
						this.mountPoints[mountPoint] = mountSource;
						this.ext3fsMountButtonModel.label = $L("Unmount Ext3fs");
						this.ext3fsMountButtonModel.disabled = false;
						this.controller.modelChanged(this.ext3fsMountButtonModel);
					}
					if ((mountPoint == "/opt") && this.partitionSizes["ext3fs"]) {
						this.mountPoints[mountPoint] = mountSource;
						this.optwareMountButtonModel.label = $L("Unmount Optware");
						this.optwareMountButtonModel.disabled = false;
						this.controller.modelChanged(this.optwareMountButtonModel);
					}
				}
			}
		}
	}

	this.mountList.mojo.noticeUpdatedItems(0, this.mountsModel.items);
	this.mountList.mojo.setLength(this.mountsModel.items.length);

	if (jailActive) {
		this.errorMessage("<b>Danger Will Robinson!</b><br>Jails are active. Reboot your device and then immediately relaunch only this program and no other applications before continuing.");
		this.status.innerHTML = "Reboot required ...";
		this.newNameModel.disabled = true;
		this.controller.modelChanged(this.newNameModel);
		this.newValueModel.disabled = true;
		this.controller.modelChanged(this.newValueModel);
		this.unmountFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.unmountFilesystemButtonModel);
		this.checkFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.checkFilesystemButtonModel);
		this.resizeFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);
		this.mountFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.mountFilesystemButtonModel);
		this.mediaMountButtonModel.disabled = true;
		this.controller.modelChanged(this.mediaMountButtonModel);
		this.ext3fsMountButtonModel.disabled = true;
		this.controller.modelChanged(this.ext3fsMountButtonModel);
		this.optwareMountButtonModel.disabled = true;
		this.controller.modelChanged(this.optwareMountButtonModel);
		this.rebootRequired = true;
	}

	this.overlay.hide();
};

MainAssistant.prototype.volumeTapped = function(event)
{
	if (this.rebootRequired) return;
	this.newNameModel.value = this.partitionNames[event.item.name];
	this.controller.modelChanged(this.newNameModel);
	this.newNameChanged({value:event.item.name});
};

MainAssistant.prototype.newNameChanged = function(event)
{
	this.targetPartition = event.value;
	this.newValueModel.value = this.partitionSizes[this.targetPartition];
	this.newValueModel.disabled = false;
	this.controller.modelChanged(this.newValueModel);

	this.statusTitle.innerHTML = this.partitionNames[this.targetPartition]+" Partition Status";

	if (this.targetPartition == "swap") {
		this.checkFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.checkFilesystemButtonModel);
	}
	else {
		this.checkFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.checkFilesystemButtonModel);
	}

	this.newValueChanged({value: this.newValueModel.value});
};

MainAssistant.prototype.newValueChanged = function(event)
{
	this.resizeValue = event.value || 0;

	var newFreeSpace = this.partitionSizes[this.targetPartition] - this.resizeValue + this.freeSpace;
	if (newFreeSpace > 0) {
		this.freeSpaceValue.innerHTML = newFreeSpace + " MiB";
	}
	else {
		this.freeSpaceValue.innerHTML = "None";
	}
	
	if (event.value === "0") {
		this.status.innerHTML = "Tap 'Delete Partition' to begin.";
		this.resizePartitionButtonModel.label = $L("Delete Partition");
		this.resizePartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.resizePartitionButtonModel);
	}
	else if ((this.resizeValue == 0) || (this.resizeValue == this.partitionSizes[this.targetPartition])) {
		this.status.innerHTML = "Select partition ...";
		this.resizePartitionButtonModel.label = $L("Resize Partition");
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);
	}
	else if (newFreeSpace < 0) {
		this.status.innerHTML = "Not enough free space!";
		this.resizePartitionButtonModel.label = $L("No Free Space");
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);
	}
	else {
		this.status.innerHTML = "Tap 'Resize Partition' to begin.";
		this.resizePartitionButtonModel.label = $L("Resize Partition");
		this.resizePartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.resizePartitionButtonModel);
	}
};

MainAssistant.prototype.unmountFilesystemTap = function(event)
{
	var name = this.targetPartition;

	this.status.innerHTML = "Unmounting "+this.partitionNames[name]+" ...";
	
}

MainAssistant.prototype.unmountFilesystem = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
	}

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (unmountFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.unmountFilesystemButton.mojo.deactivate();
		return;
	}

	if (payload.stdErr) {
		// this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		// this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {
		this.unmountFilesystemButton.mojo.deactivate();
	}
};

MainAssistant.prototype.checkFilesystemTap = function(event)
{
	var name = this.targetPartition;

	this.status.innerHTML = "Checking "+this.partitionNames[name]+" ...";
	
	this.request = TailorService.checkFilesystem(this.checkFilesystemHandler, "/dev/mapper/store-"+name);
}

MainAssistant.prototype.checkFilesystem = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stdOut = " 42 blocks used (42.0%)";
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		// this.errorMessage('<b>Service Error (checkFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Filesystem Check Failed</b>');
		this.status.innerHTML = "Filesystem Check Failed";
		this.checkFilesystemButton.mojo.deactivate();
		return;
	}

	if (payload.stdErr) {
		// this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		// this.status.innerHTML = payload.stdOut;
		if (payload.stdOut.match(/^Pass /)) {
			this.status.innerHTML = payload.stdOut;
		}
		if (payload.stdOut.match(/^\s+\d+ bytes per cluster$/)) {
			var matches = payload.stdOut.match(/\d+/g);
			if (matches.length == 1) {
				this.clusterSize = matches[0];
			}
		}
		if (payload.stdOut.match(/ \d+ files, \d+.\d+ clusters/)) {
			var matches = payload.stdOut.match(/\d+/g);
			if (matches.length == 3) {
				var freeSpace = (matches[2]-matches[1])*this.clusterSize;
				this.status.innerHTML = "Free space: "+this.showValue(freeSpace, "B");
			}
		}
		if (payload.stdOut.match(/^\s+\d+ blocks used .[0-9.]+%.$/)) {
			this.status.innerHTML = payload.stdOut;
			var matches = payload.stdOut.match(/[0-9.]+/g);
			if (matches.length == 2) {
				var freeSpace = 4096*matches[0]*((100-matches[1])/matches[1]);
				this.status.innerHTML = "Free space: "+this.showValue(freeSpace, "B");
			}
		}
	}
	
	if (payload.stage == "end") {
		this.checkFilesystemButton.mojo.deactivate();
	}
};

MainAssistant.prototype.resizeFilesystemTap = function(event)
{
	var name = this.targetPartition;
	var value = this.newValueModel.value;

	if (value == "0") {
		this.status.innerHTML = "Removing "+this.partitionNames[name];
	}
	else if (value < this.partitionSizes[name]) {
		this.status.innerHTML = "Reducing to "+this.showValue(value, "MiB");
	}
	else if (value > this.partitionSizes[name]) {
		this.status.innerHTML = "Extending to "+this.showValue(value, "MiB");
	}
	else {
		this.status.innerHTML = "Unchanged at "+this.showValue(value, "MiB");
	}
	
	// %%% Do stuff %%%

	this.resizeFilesystemButton.mojo.deactivate();
};

MainAssistant.prototype.resizePartitionTap = function(event)
{
	var name = this.targetPartition;
	var value = this.newValueModel.value;

	if (value == "0") {
		this.status.innerHTML = "Removing "+this.partitionNames[name];
	}
	else if (value < this.partitionSizes[name]) {
		this.status.innerHTML = "Reducing to "+this.showValue(value, "MiB");
	}
	else if (value > this.partitionSizes[name]) {
		this.status.innerHTML = "Extending to "+this.showValue(value, "MiB");
	}
	else {
		this.status.innerHTML = "Unchanged at "+this.showValue(value, "MiB");
	}
	
	// %%% Do stuff %%%

	this.resizePartitionButton.mojo.deactivate();
};

MainAssistant.prototype.mountFilesystemTap = function(event)
{
	var name = this.targetPartition;

	this.status.innerHTML = "Mounting "+this.partitionNames[name]+" ...";
	
	// %%% Do stuff %%%
}

MainAssistant.prototype.mountFilesystem = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
	}

	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (mountFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.mountFilesystemButton.mojo.deactivate();
		return;
	}

	if (payload.stdErr) {
		// this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		// this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {
		this.mountFilesystemButton.mojo.deactivate();
	}
};

MainAssistant.prototype.mediaMountTap = function(event)
{
	if (this.mountPoints["/media/internal"]) {
		this.request = TailorService.unmountMedia(this.mediaMountHandler);
	}
	else {
		this.request = TailorService.mountMedia(this.mediaMountHandler);
	}
}

MainAssistant.prototype.mediaMount = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (mediaMount):</b><br>'+payload.errorText, payload.stdErr);
	}

	this.mediaMountButton.mojo.deactivate();
	this.refresh();
};

MainAssistant.prototype.ext3fsMountTap = function(event)
{
	if (this.mountPoints["/media/ext3fs"]) {
		this.request = TailorService.unmountExt3fs(this.ext3fsMountHandler);
	}
	else {
		this.request = TailorService.mountExt3fs(this.ext3fsMountHandler);
	}
};

MainAssistant.prototype.ext3fsMount = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (ext3fsMount):</b><br>'+payload.errorText, payload.stdErr);
	}

	this.ext3fsMountButton.mojo.deactivate();
	this.refresh();
};

MainAssistant.prototype.optwareMountTap = function(event)
{
	if (this.mountPoints["/opt"]) {
		this.request = TailorService.unmountOptware(this.optwareMountHandler);
	}
	else {
		this.request = TailorService.mountOptware(this.optwareMountHandler);
	}
};

MainAssistant.prototype.optwareMount = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (optwareMount):</b><br>'+payload.errorText, payload.stdErr);
	}

	this.optwareMountButton.mojo.deactivate();
	this.refresh();
};

MainAssistant.prototype.getRandomSubTitle = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomSub.length; r++) {
		weight += this.randomSub[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	//alert('rand: ' + rand + ' of ' + weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomSub.length; r++) {
		if (rand <= this.randomSub[r].weight) {
			return this.randomSub[r].text;
		}
		else {
			rand -= this.randomSub[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomSub[0].text;
};

MainAssistant.prototype.showValue = function(value, units)
{
	while ((value > 1024) || (value < -1024)) {
		value = value / 1024;
		switch (units) {
		case "B": units = "KiB"; break;
		case "KiB": units = "MiB"; break;
		case "MiB": units = "GiB"; break;
		}
	}
	return Math.round(value*1000)/1000+" "+units;
};

MainAssistant.prototype.onlyNumbers = function (charCode)
{
	if (charCode > 47 && charCode < 58) {
		return true;
	}
	return false;
};

MainAssistant.prototype.errorMessage = function(message, stdErr)
{
	if (stdErr && stdErr.length) {
		message = message + '<br>' + stdErr.join('<br>');
	}

	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				"Tailor",
			message:			message,
			choices:			[{label:$L("Ok"), value:'ok'}],
			onChoose:			function(e){}
		});
};

MainAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
		case 'do-refresh':
		this.refresh();
		break;
		
		case 'do-prefs':
		this.controller.stageController.pushScene('preferences');
		break;
		
		case 'do-help':
		this.controller.stageController.pushScene('help');
		break;
		}
	}
};

MainAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.volumeList, Mojo.Event.listTap, this.volumeTappedHandler);
	this.controller.stopListening(this.newNameList, Mojo.Event.propertyChange, this.newNameChangedHandler);
	this.controller.stopListening(this.newValueField, Mojo.Event.propertyChange, this.newValueChangedHandler);
	this.controller.stopListening(this.checkFilesystemButton,  Mojo.Event.tap, this.checkFilesystemTapHandler);
	this.controller.stopListening(this.resizeFilesystemButton,  Mojo.Event.tap, this.resizeFilesystemTapHandler);
	this.controller.stopListening(this.resizePartitionButton,  Mojo.Event.tap, this.resizePartitionTapHandler);
	this.controller.stopListening(this.mediaMountButton,  Mojo.Event.tap, this.mediaMountTapHandler);
	this.controller.stopListening(this.ext3fsMountButton,  Mojo.Event.tap, this.ext3fsMountTapHandler);
	this.controller.stopListening(this.optwareMountButton,  Mojo.Event.tap, this.optwareMountTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
