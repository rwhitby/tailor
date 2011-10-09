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
	
	this.freeSpaceModel = {label: "Unused Space:", name: "unused", title: "None", labelClass: 'left', titleClass: 'right'};

	this.targetActivityModel = { choices: [], disabled: true };

	this.unmountPartitionButtonModel = {
		label: $L("Unmount Partition"),
		disabled: true
	};

	this.checkFilesystemButtonModel = {
		label: $L("Check Filesystem"),
		disabled: true
	};

	this.newFilesystemSizeModel = { disabled: true };

	this.resizeFilesystemButtonModel = {
		label: $L("Resize Filesystem"),
		disabled: true
	};

	this.newPartitionSizeModel = { disabled: true };

	this.resizePartitionButtonModel = {
		label: $L("Resize Partition"),
		disabled: true
	};

	this.mountPartitionButtonModel = {
		label: $L("Mount Partition"),
		disabled: true
	};

	this.initialPartitionSizeModel = { disabled: true };

	this.createPartitionButtonModel = {
		label: $L("Create Partition"),
		disabled: true
	};

	this.initialFilesystemSizeModel = { disabled: true };

	this.createFilesystemButtonModel = {
		label: $L("Create Filesystem"),
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
	this.targetActivity = false;

	this.partitionNames = {
		"unused":"Unused Space",
		"media":"USB (media)",
		"ext3fs":"User (ext3)",
		"cm-system":"Android (system)",
		"cm-cache":"Android (cache)",
		"cm-data":"Android (data)",
	};

	this.mountNames = {
		"/dev/mapper/store-media":"USB (media)",
		"/dev/mapper/store-ext3fs":"User (ext3)",
		"/dev/mapper/store-cm-system":"Android (system)",
		"/dev/mapper/store-cm-cache":"Android (cache)",
		"/dev/mapper/store-cm-data":"Android (data)",
	};

	this.partitionSize = false;
	this.filesystemSize = false;
	this.filesystemFree = false;
	this.partitionMounts = false;
	this.mountPoints = false;

	this.rebootRequired = false;

	this.timer = false;
	this.heartbeatValue = "*";

	this.emulatorMountState = {
		"media": false,
		"ext3fs" : false,
		"cm-system" : false,
		"cm-cache" : false,
		"cm-data" : false,
	}

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

	this.statusTitle = 		this.controller.get('statusTitle');
	this.status = 			this.controller.get('status');
	
	this.activityTitle =	this.controller.get('activityTitle');

	this.partitionActivity = this.controller.get('partitionActivity');

	this.partitionSizeField =	this.controller.get('partitionSize');
	this.filesystemSizeField =	this.controller.get('filesystemSize');
	this.filesystemUsedField =	this.controller.get('filesystemUsed');
	this.filesystemFreeField =	this.controller.get('filesystemFree');

	this.unmountPartitionButton = this.controller.get('unmountPartitionButton');

	this.checkFilesystemButton =   this.controller.get('checkFilesystemButton');

	this.newFilesystemSizeField =	this.controller.get('newFilesystemSize');
	this.resizeFilesystemButton =  this.controller.get('resizeFilesystemButton');

	this.newPartitionSizeField =	this.controller.get('newPartitionSize');
	this.resizePartitionButton =   this.controller.get('resizePartitionButton');

	this.mountPartitionButton =   this.controller.get('mountPartitionButton');

	this.initialPartitionSizeField =	this.controller.get('initialPartitionSize');
	this.createPartitionButton =   this.controller.get('createPartitionButton');

	this.initialFilesystemSizeField =	this.controller.get('initialFilesystemSize');
	this.createFilesystemButton =  this.controller.get('createFilesystemButton');

	this.mediaMountButton  = this.controller.get('mediaMountButton');
	this.ext3fsMountButton = this.controller.get('ext3fsMountButton');
	this.optwareMountButton = this.controller.get('optwareMountButton');

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
	this.targetActivityChangedHandler =  this.targetActivityChanged.bindAsEventListener(this);
	this.unmountPartitionTapHandler = this.unmountPartitionTap.bindAsEventListener(this);
	this.unmountPartitionHandler = this.unmountPartition.bindAsEventListener(this);
	this.checkFilesystemTapHandler = this.checkFilesystemTap.bindAsEventListener(this);
	this.checkFilesystemHandler = this.checkFilesystem.bindAsEventListener(this);
	this.newFilesystemSizeChangedHandler =  this.newFilesystemSizeChanged.bindAsEventListener(this);
	this.resizeFilesystemTapHandler = this.resizeFilesystemTap.bindAsEventListener(this);
	this.newPartitionSizeChangedHandler =  this.newPartitionSizeChanged.bindAsEventListener(this);
	this.resizePartitionTapHandler = this.resizePartitionTap.bindAsEventListener(this);
	this.mountPartitionTapHandler = this.mountPartitionTap.bindAsEventListener(this);
	this.mountPartitionHandler = this.mountPartition.bindAsEventListener(this);
	this.initialPartitionSizeChangedHandler =  this.initialPartitionSizeChanged.bindAsEventListener(this);
	this.createPartitionTapHandler = this.createPartitionTap.bindAsEventListener(this);
	this.initialFilesystemSizeChangedHandler =  this.initialFilesystemSizeChanged.bindAsEventListener(this);
	this.createFilesystemTapHandler = this.createFilesystemTap.bindAsEventListener(this);
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

	this.controller.setupWidget('partitionActivity', { label: "Activity" }, this.targetActivityModel);
	this.controller.listen(this.partitionActivity, Mojo.Event.propertyChange, this.targetActivityChangedHandler);

	this.controller.setupWidget('unmountPartitionButton', { type: Mojo.Widget.activityButton }, this.unmountPartitionButtonModel);
	this.controller.listen(this.unmountPartitionButton, Mojo.Event.tap, this.unmountPartitionTapHandler);
	this.controller.setupWidget('checkFilesystemButton', { type: Mojo.Widget.activityButton }, this.checkFilesystemButtonModel);
	this.controller.listen(this.checkFilesystemButton, Mojo.Event.tap, this.checkFilesystemTapHandler);

	this.controller.setupWidget('newFilesystemSize', {
			autoFocus: false,
				autoReplace: false,
				// hintText: 'Enter new partition size ...',
				multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				maxLength: 6,
				preventResize: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				// modifierState: Mojo.Widget.numLock,
				charsAllow: this.onlyNumbers.bind(this)
				},
		this.newFilesystemSizeModel);
	this.controller.listen(this.newFilesystemSizeField, Mojo.Event.propertyChange, this.newFilesystemSizeChangedHandler);
	this.controller.setupWidget('resizeFilesystemButton', { type: Mojo.Widget.activityButton }, this.resizeFilesystemButtonModel);
	this.controller.listen(this.resizeFilesystemButton, Mojo.Event.tap, this.resizeFilesystemTapHandler);

	this.controller.setupWidget('newPartitionSize', {
			autoFocus: false,
				autoReplace: false,
				// hintText: 'Enter new partition size ...',
				multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				maxLength: 6,
				preventResize: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				// modifierState: Mojo.Widget.numLock,
				charsAllow: this.onlyNumbers.bind(this)
				},
		this.newPartitionSizeModel);
	this.controller.listen(this.newPartitionSizeField, Mojo.Event.propertyChange, this.newPartitionSizeChangedHandler);
	this.controller.setupWidget('resizePartitionButton', { type: Mojo.Widget.activityButton }, this.resizePartitionButtonModel);
	this.controller.listen(this.resizePartitionButton, Mojo.Event.tap, this.resizePartitionTapHandler);

	this.controller.setupWidget('initialPartitionSize', {
			autoFocus: false,
				autoReplace: false,
				// hintText: 'Enter initial partition size ...',
				multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				maxLength: 6,
				preventResize: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				// modifierState: Mojo.Widget.numLock,
				charsAllow: this.onlyNumbers.bind(this)
				},
		this.initialPartitionSizeModel);
	this.controller.listen(this.initialPartitionSizeField, Mojo.Event.propertyChange, this.initialPartitionSizeChangedHandler);
	this.controller.setupWidget('createPartitionButton', { type: Mojo.Widget.activityButton }, this.createPartitionButtonModel);
	this.controller.listen(this.createPartitionButton, Mojo.Event.tap, this.createPartitionTapHandler);

	this.controller.setupWidget('initialFilesystemSize', {
			autoFocus: false,
				autoReplace: false,
				// hintText: 'Enter initial partition size ...',
				multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				maxLength: 6,
				preventResize: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				// modifierState: Mojo.Widget.numLock,
				charsAllow: this.onlyNumbers.bind(this)
				},
		this.initialFilesystemSizeModel);
	this.controller.listen(this.initialFilesystemSizeField, Mojo.Event.propertyChange, this.initialFilesystemSizeChangedHandler);
	this.controller.setupWidget('createFilesystemButton', { type: Mojo.Widget.activityButton }, this.createFilesystemButtonModel);
	this.controller.listen(this.createFilesystemButton, Mojo.Event.tap, this.createFilesystemTapHandler);

	this.controller.setupWidget('mountPartitionButton', { type: Mojo.Widget.activityButton }, this.mountPartitionButtonModel);
	this.controller.listen(this.mountPartitionButton, Mojo.Event.tap, this.mountPartitionTapHandler);

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
	// Only initialise this once
	if (this.partitionSize === false) {
		this.partitionSize = {
			"media":"0",
			"ext3fs":"0",
			"cm-system":"0",
			"cm-cache":"0",
			"cm-data":"0",
		};
	}
	// Only initialise this once
	if (this.filesystemSize === false) {
		this.filesystemSize = {
			"media":false,
			"ext3fs":false,
			"cm-system":false,
			"cm-cache":false,
			"cm-data":false,
		};
	}
	// Only initialise this once
	if (this.filesystemFree === false) {
		this.filesystemFree = {
			"media":false,
			"ext3fs":false,
			"cm-system":false,
			"cm-cache":false,
			"cm-data":false,
		};
	}
	this.partitionMounts = {
		"media":[],
		"ext3fs":[],
		"cm-system":[],
		"cm-cache":[],
		"cm-data":[],
	};
	this.mountPoints = {
		"/media/internal": false,
		"/media/ext3fs": false,
		"/opt": false
	}
	this.volumesModel.items = [];
	this.statusTitle.innerHTML = "Partition Status";
	this.status.innerHTML = "Idle";
	this.partitionSizeField.innerHTML =	"Unknown";
	this.filesystemSizeField.innerHTML = "Unknown";
	this.filesystemUsedField.innerHTML = "Unknown";
	this.filesystemFreeField.innerHTML = "Unknown";
	this.targetActivityModel.disabled = true;
	this.controller.modelChanged(this.targetActivityModel);
	this.unmountPartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.unmountPartitionButtonModel);
	this.checkFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.checkFilesystemButtonModel);
	this.newFilesystemSizeModel.disabled = true;
	this.controller.modelChanged(this.newFilesystemSizeModel);
	this.resizeFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.resizeFilesystemButtonModel);
	this.newPartitionSizeModel.disabled = true;
	this.controller.modelChanged(this.newPartitionSizeModel);
	this.resizePartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.resizePartitionButtonModel);
	this.initialPartitionSizeModel.disabled = true;
	this.controller.modelChanged(this.initialPartitionSizeModel);
	this.createPartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.createPartitionButtonModel);
	this.initialFilesystemSizeModel.disabled = true;
	this.controller.modelChanged(this.initialFilesystemSizeModel);
	this.createFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.createFilesystemButtonModel);
	this.mountPartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.mountPartitionButtonModel);
	this.mountsModel.items = [];
	this.mediaMountButtonModel.disabled = true;
	this.controller.modelChanged(this.mediaMountButtonModel);
	this.ext3fsMountButtonModel.disabled = true;
	this.controller.modelChanged(this.ext3fsMountButtonModel);
	this.optwareMountButtonModel.disabled = true;
	this.controller.modelChanged(this.optwareMountButtonModel);
	this.status.innerHTML = "Reading volume groups ...";
	this.request = TailorService.listGroups(this.listGroupsHandler);
};

MainAssistant.prototype.listGroups = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		payload.stdOut = [ "store:::::::::::15507456:8192:::111:" ]
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error reading volume groups ...";
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

	this.status.innerHTML = "Reading logical volumes ...";
	this.request = TailorService.listVolumes(this.listVolumesHandler, "store");
};

MainAssistant.prototype.listVolumes = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		payload.returnValue = true;
		payload.stdOut = [
						  "/dev/store/media:::::::1408:::::",
						  "/dev/store/ext3fs:::::::256:::::",
						  ];
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error reading logical volumes ...";
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
					this.partitionSize[name] = size;
					this.volumesModel.items.push({label: this.partitionNames[name]+":", title: this.showValue(size, "MiB"), name: name, labelClass: 'left', titleClass: 'right'});
					if (!this.targetPartition) {
						this.targetPartition = name;
					}
				}
			}
		}
	}

	if (this.freeSpace) {
		this.freeSpaceModel.title = this.showValue(this.freeSpace, "MiB");
	}
	else {
		this.freeSpaceModel.title = "None";
	}
	this.volumesModel.items.push(this.freeSpaceModel);

	this.volumeList.mojo.noticeUpdatedItems(0, this.volumesModel.items);
	this.volumeList.mojo.setLength(this.volumesModel.items.length);

	this.targetActivityModel.choices = [];
	this.targetActivityModel.choices.push({'label':"Idle", 'value':"Idle"});
	this.targetActivityModel.choices.push({'label':"Unmount Partition", 'value':"Unmount Partition"});
	this.targetActivityModel.choices.push({'label':"Check Filesystem", 'value':"Check Filesystem"});
	this.targetActivityModel.choices.push({'label':"Resize Filesystem", 'value':"Resize Filesystem"});
	this.targetActivityModel.choices.push({'label':"Resize Partition", 'value':"Resize Partition"});
	this.targetActivityModel.choices.push({'label':"Mount Partition", 'value':"Mount Partition"});
	this.targetActivityModel.choices.push({'label':"Create Partition", 'value':"Create Partition"});
	this.targetActivityModel.choices.push({'label':"Create Filesystem", 'value':"Create Filesystem"});
	this.targetActivityModel.value = this.targetActivity;
	if (!this.targetActivityModel.value) {
		this.targetActivityModel.value = this.targetActivityModel.choices[0].label;
	}
	this.targetActivityModel.disabled = false;
	this.controller.modelChanged(this.targetActivityModel);

	this.checkFilesystemButtonModel.disabled = false;
	this.controller.modelChanged(this.checkFilesystemButtonModel);

	if (!this.targetActivity) {
		this.targetActivity = this.targetActivityModel.choices[0].value;
	}

	// Do this after the mounts have been determined
	// this.targetActivityChanged({value:this.targetActivity});

	this.status.innerHTML = "Reading mounts ...";
	this.request = TailorService.listMounts(this.listMountsHandler);
};

MainAssistant.prototype.listMounts = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		payload.returnValue = true;
		payload.stdOut = [];
		if (this.emulatorMountState["media"]) {
			payload.stdOut.push("/dev/mapper/store-media /media/internal vfat rw 0 0");
		}
		if (this.emulatorMountState["ext3fs"]) {
			payload.stdOut.push("/dev/mapper/store-ext3fs /media/ext3fs ext3 rw 0 0");
		}
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error reading mounts ...";
		this.errorMessage('<b>Service Error (listMounts):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
		return;
	}

	if (this.partitionSize["media"]) {
		this.mediaMountButtonModel.label = $L("Mount Media");
		this.mediaMountButtonModel.disabled = false;
		this.controller.modelChanged(this.mediaMountButtonModel);
	}

	if (this.partitionSize["ext3fs"]) {
		this.ext3fsMountButtonModel.label = $L("Mount Ext3fs");
		this.ext3fsMountButtonModel.disabled = false;
		this.controller.modelChanged(this.ext3fsMountButtonModel);
	}

	if (this.partitionSize["ext3fs"]) {
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

				if (mountPoint.indexOf("/var/palm/jail/") != -1) {
					jailActive = true;
				}

				if ((mountType == "ext3") || (mountType == "vfat")) {

					if (this.mountNames[mountSource]) {
						this.mountsModel.items.push({label: this.mountNames[mountSource], title: mountPoint, labelClass: 'left', titleClass: 'right'});
					}

					if ((mountSource == "/dev/mapper/store-media") && this.partitionSize["media"]) {
						this.partitionMounts["media"].push(mountPoint);
					}
					if ((mountSource == "/dev/mapper/store-ext3fs") && this.partitionSize["ext3fs"]) {
						this.partitionMounts["ext3fs"].push(mountPoint);
					}

					// These will eventually be deprecated
					if ((mountPoint == "/media/internal") && this.partitionSize["media"]) {
						this.mountPoints[mountPoint] = mountSource;
						this.mediaMountButtonModel.label = $L("Unmount Media");
						this.mediaMountButtonModel.disabled = false;
						this.controller.modelChanged(this.mediaMountButtonModel);
					}
					if ((mountPoint == "/media/ext3fs") && this.partitionSize["ext3fs"]) {
						this.mountPoints[mountPoint] = mountSource;
						this.ext3fsMountButtonModel.label = $L("Unmount Ext3fs");
						this.ext3fsMountButtonModel.disabled = false;
						this.controller.modelChanged(this.ext3fsMountButtonModel);
					}
					if ((mountPoint == "/opt") && this.partitionSize["ext3fs"]) {
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

	this.status.innerHTML = "Ready";

	if (jailActive) {
		this.status.innerHTML = "Reboot required ...";
		this.errorMessage("<b>Danger Will Robinson!</b><br>Jails are active. Reboot your device and then immediately relaunch only this program and no other applications before continuing.");
		this.targetActivityModel.disabled = true;
		this.controller.modelChanged(this.targetActivityModel);
		this.unmountPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.unmountPartitionButtonModel);
		this.checkFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.checkFilesystemButtonModel);
		this.newFilesystemSizeModel.disabled = true;
		this.controller.modelChanged(this.newFilesystemSizeModel);
		this.resizeFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
		this.newPartitionSizeModel.disabled = true;
		this.controller.modelChanged(this.newPartitionSizeModel);
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);
		this.mountPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.mountPartitionButtonModel);
		this.initialPartitionSizeModel.disabled = true;
		this.controller.modelChanged(this.initialPartitionSizeModel);
		this.createPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.createPartitionButtonModel);
		this.initialFilesystemSizeModel.disabled = true;
		this.controller.modelChanged(this.initialFilesystemSizeModel);
		this.createFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.createFilesystemButtonModel);
		this.mediaMountButtonModel.disabled = true;
		this.controller.modelChanged(this.mediaMountButtonModel);
		this.ext3fsMountButtonModel.disabled = true;
		this.controller.modelChanged(this.ext3fsMountButtonModel);
		this.optwareMountButtonModel.disabled = true;
		this.controller.modelChanged(this.optwareMountButtonModel);
		this.rebootRequired = true;
	}

	// This will enable or disable the buttons appropriately
	this.selectTargetPartition(this.targetPartition);

	this.overlay.hide();
};

MainAssistant.prototype.volumeTapped = function(event)
{
	if (this.rebootRequired) return;
	if (event.item.name) {
		this.selectTargetPartition(event.item.name);
	}
};

MainAssistant.prototype.selectTargetPartition = function(name)
{
	this.targetPartition = name;

	this.activityTitle.innerHTML = "Select Activity for "+this.partitionNames[this.targetPartition]+" ...";

	this.statusTitle.innerHTML = this.partitionNames[this.targetPartition]+" Partition Status";

	if (this.targetPartition == 'unused') {
		this.partitionSizeField.innerHTML = this.showValue(this.freeSpace, "MiB");
	}
	else {
		this.partitionSizeField.innerHTML = this.partitionSize[this.targetPartition]+" MiB";
	}
			
	this.filesystemSizeField.innerHTML = "Unknown";
	this.filesystemUsedField.innerHTML = "Unknown";
	this.filesystemFreeField.innerHTML = "Unknown";

	// Check if the partition is mounted or not
	if (this.partitionMounts[this.targetPartition] && this.partitionMounts[this.targetPartition].length) {
		this.filesystemSizeField.innerHTML =
			this.filesystemUsedField.innerHTML =
			this.filesystemFreeField.innerHTML = "Unmount Filesystem ...";
		this.unmountPartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.unmountPartitionButtonModel);
		this.checkFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.checkFilesystemButtonModel);
		this.resizeFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);
		this.mountPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.mountPartitionButtonModel);
	}
	else {
		this.unmountPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.unmountPartitionButtonModel);
		this.checkFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.checkFilesystemButtonModel);
		this.resizeFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);

		// Check if the partition has a non-zero size
		if (this.partitionSize[this.targetPartition] > 0) {
			this.filesystemSizeField.innerHTML =
				this.filesystemUsedField.innerHTML =
				this.filesystemFreeField.innerHTML = "Check Filesystem ...";
			this.mountPartitionButtonModel.disabled = false;
			this.controller.modelChanged(this.mountPartitionButtonModel);
		}
		else {
			this.filesystemSizeField.innerHTML =
			this.filesystemUsedField.innerHTML =
			this.filesystemFreeField.innerHTML = "Create Filesystem ...";
			this.mountPartitionButtonModel.disabled = true;
			this.controller.modelChanged(this.mountPartitionButtonModel);
		}
	}

	this.targetActivityChanged({value:this.targetActivity});
};

MainAssistant.prototype.targetActivityChanged = function(event)
{
	this.targetActivity = event.value;

	if (this.targetActivity == 'Idle') {
		this.status.innerHTML = "Select Activity for "+this.partitionNames[this.targetPartition]+" ...";
	}
	else {
		this.status.innerHTML = "Ready to "+this.targetActivity+" on "+this.partitionNames[this.targetPartition]+" ...";
	}
};

MainAssistant.prototype.unmountPartitionTap = function(event)
{
	var name = this.targetPartition;

	this.status.innerHTML = "Unmounting "+this.partitionNames[name]+" ...";
	
	switch (name) {
	case "media":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["media"] = false;
			this.unmountPartitionButton.mojo.deactivate();
			this.refresh();
		}
		else {
			this.request = TailorService.unmountMedia(this.unmountPartitionHandler);
		}
		break;
	case "ext3fs":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["ext3fs"] = false;
			this.unmountPartitionButton.mojo.deactivate();
			this.refresh();
		}
		else {
			this.request = TailorService.unmountExt3fs(this.unmountPartitionHandler);
		}
		break;
	default:
		// Should never happen
		this.unmountPartitionButton.mojo.deactivate();
		break;
	}
}

MainAssistant.prototype.unmountPartition = function(payload)
{
	if (payload.returnValue === false) {
		this.status.innerHTML = "Error unmounting "+this.partitionNames[this.targetPartition]+" ...";
		this.errorMessage('<b>Service Error (unmountPartition):</b><br>'+payload.errorText, payload.stdErr);
	}

	this.unmountPartitionButton.mojo.deactivate();
	this.refresh();
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
		if (this.targetPartition == "media") {
			payload.stdOut = " "+this.partitionSize[this.targetPartition]*1024/8+" blocks used (50.0%)";
		}
		if (this.targetPartition == "ext3fs") {
			payload.stdOut = " "+this.partitionSize[this.targetPartition]*1024/4+" blocks used (100.0%)";
		}
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		// this.errorMessage('<b>Service Error (checkFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.status.innerHTML = "Error checking "+this.partitionNames[this.targetPartition]+" ...";
		this.errorMessage('<b>Filesystem Check Failed</b>');
		this.checkFilesystemButton.mojo.deactivate();
		this.resizeFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
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
				this.clusterSize = Math.floor(matches[0]);
			}
		}
		if (payload.stdOut.match(/^Data area starts at byte \d+ .sector \d+.$/)) {
			var matches = payload.stdOut.match(/\d+/g);
			if (matches.length == 2) {
				this.dataOffset = Math.floor(matches[0]);
			}
		}
		if (payload.stdOut.match(/ \d+ files, \d+.\d+ clusters/)) {
			var matches = payload.stdOut.match(/\d+/g);
			if (matches.length == 3) {
				var totalSpace = Math.floor(((matches[2]*this.clusterSize)+this.dataOffset)/1048756);
				// Allow for a 16MB margin of calculation error
				if ((this.partitionSize[this.targetPartition] - totalSpace) < 16) {
					totalSpace = this.partitionSize[this.targetPartition];
				}
				var freeSpace = Math.floor(((matches[2]-matches[1])*this.clusterSize)/1048756);
				var usedSpace = totalSpace - freeSpace;
				this.filesystemSizeField.innerHTML = totalSpace+" MiB";
				this.filesystemUsedField.innerHTML = usedSpace+" MiB";
				this.filesystemFreeField.innerHTML = freeSpace+" MiB";
				this.filesystemSize[this.targetPartition] = totalSpace;
				this.filesystemFree[this.targetPartition] = freeSpace;
			}
		}
		if (payload.stdOut.match(/^\s+\d+ blocks used .[0-9.]+%.$/)) {
			this.status.innerHTML = payload.stdOut;
			var matches = payload.stdOut.match(/[0-9.]+/g);
			if (matches.length == 2) {
				var totalSpace = Math.floor(4*matches[0]*100/matches[1]/1024);
				// Allow for a 16MB margin of calculation error
				if ((this.partitionSize[this.targetPartition] - totalSpace) < 16) {
					totalSpace = this.partitionSize[this.targetPartition];
				}
				var usedSpace = Math.floor(4*matches[0]/1024+0.5);
				var freeSpace = totalSpace - usedSpace;
				this.filesystemSizeField.innerHTML = totalSpace+" MiB";
				this.filesystemUsedField.innerHTML = usedSpace+" MiB";
				this.filesystemFreeField.innerHTML = freeSpace+" MiB";
				this.filesystemSize[this.targetPartition] = totalSpace;
				this.filesystemFree[this.targetPartition] = freeSpace;
			}
		}
	}
	
	if (payload.stage == "end") {

		this.status.innerHTML = "Filesystem Check Passed";

		this.checkFilesystemButton.mojo.deactivate();

		this.checkFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.checkFilesystemButtonModel);

		if (this.filesystemFree[this.targetPartition]) {
			this.newFilesystemSizeModel.disabled = false;
			this.newFilesystemSizeModel.value = this.filesystemSize[this.targetPartition];
			this.controller.modelChanged(this.newFilesystemSizeModel);
			this.newFilesystemSizeChanged({value: this.newFilesystemSizeModel.value});
			this.newFilesystemSizeField.mojo.focus();
		}
		else {
			this.newFilesystemSizeModel.disabled = true;
			this.controller.modelChanged(this.newFilesystemSizeModel);
			this.resizeFilesystemButtonModel.label = $L("Cannot Resize Filesystem");
			this.resizeFilesystemButtonModel.disabled = true;
			this.controller.modelChanged(this.resizeFilesystemButtonModel);
			this.newFilesystemSizeField.mojo.blur();
		}
	}
};

MainAssistant.prototype.newFilesystemSizeChanged = function(event)
{
	this.resizeValue = event.value || 0;

	var filesystemFreeSpace = (this.filesystemSize[this.targetPartition]
							   - this.resizeValue
							   + this.filesystemFree[this.targetPartition]);
	
	if (event.value === "0") {
		this.status.innerHTML = "Tap 'Delete Filesystem' to begin.";
		this.resizeFilesystemButtonModel.label = $L("Delete Filesystem");
		this.resizeFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
	}
	else if ((this.resizeValue == 0) || (this.resizeValue == this.filesystemSize[this.targetPartition])) {
		this.status.innerHTML = "Enter new filesystem size ...";
		this.resizeFilesystemButtonModel.label = $L("Resize Filesystem");
		this.resizeFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
	}
	else if (filesystemFreeSpace < 0) {
		this.status.innerHTML = "Not enough free space!";
		this.resizeFilesystemButtonModel.label = $L("No Free Space");
		this.resizeFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
	}
	else {
		this.status.innerHTML = "Tap 'Resize Filesystem' to begin.";
		this.resizeFilesystemButtonModel.label = $L("Resize Filesystem");
		this.resizeFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.resizeFilesystemButtonModel);
	}
};

MainAssistant.prototype.resizeFilesystemTap = function(event)
{
	var name = this.targetPartition;
	var value = this.newFilesystemSizeModel.value;

	this.newFilesystemSizeField.mojo.blur();

	if (value == "0") {
		this.status.innerHTML = "Removing "+this.partitionNames[name];
	}
	else if (value < this.filesystemSize[name]) {
		this.status.innerHTML = "Reducing to "+this.showValue(value, "MiB", "MiB");
	}
	else if (value > this.filesystemSize[name]) {
		this.status.innerHTML = "Extending to "+this.showValue(value, "MiB", "MiB");
	}
	else {
		this.status.innerHTML = "Unchanged at "+this.showValue(value, "MiB", "MiB");
	}
	
	// %%% Do stuff %%%

	this.resizeFilesystemButton.mojo.deactivate();

	this.resizeFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.resizeFilesystemButtonModel);

	if (this.filesystemFree[this.targetPartition]) {
		this.newPartitionSizeModel.disabled = false;
		this.newPartitionSizeModel.value = this.partitionSize[this.targetPartition];
		this.controller.modelChanged(this.newPartitionSizeModel);
		this.newPartitionSizeChanged({value: this.newPartitionSizeModel.value});
		this.newPartitionSizeField.mojo.focus();
	}
	else {
		this.newPartitionSizeModel.disabled = true;
		this.controller.modelChanged(this.newPartitionSizeModel);
		this.resizePartitionButtonModel.label = $L("Cannot Resize Partition");
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);
		this.newPartitionSizeField.mojo.blur();
	}
};

MainAssistant.prototype.newPartitionSizeChanged = function(event)
{
	this.resizeValue = event.value || 0;

	var partitionFreeSpace = this.partitionSize[this.targetPartition] - this.resizeValue + this.freeSpace;
	if (partitionFreeSpace > 0) {
		this.freeSpaceModel.title = partitionFreeSpace + " MiB";
	}
	else {
		this.freeSpaceModel.title = "None";
	}
	this.controller.modelChanged(this.freeSpaceModel);
	this.volumeList.mojo.noticeUpdatedItems(0, this.volumesModel.items);
	
	if (event.value === "0") {
		this.status.innerHTML = "Tap 'Delete Partition' to begin.";
		this.resizePartitionButtonModel.label = $L("Delete Partition");
		this.resizePartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.resizePartitionButtonModel);
	}
	else if ((this.resizeValue == 0) || (this.resizeValue == this.partitionSize[this.targetPartition])) {
		this.status.innerHTML = "Enter new partition size ...";
		this.resizePartitionButtonModel.label = $L("Resize Partition");
		this.resizePartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.resizePartitionButtonModel);
	}
	else if (partitionFreeSpace < 0) {
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

MainAssistant.prototype.resizePartitionTap = function(event)
{
	this.newPartitionSizeField.mojo.blur();

	var name = this.targetPartition;
	var value = this.newPartitionSizeModel.value;

	if (value == "0") {
		this.status.innerHTML = "Removing "+this.partitionNames[name];
	}
	else if (value < this.partitionSize[name]) {
		this.status.innerHTML = "Reducing to "+this.showValue(value, "MiB", "MiB");
	}
	else if (value > this.partitionSize[name]) {
		this.status.innerHTML = "Extending to "+this.showValue(value, "MiB", "MiB");
	}
	else {
		this.status.innerHTML = "Unchanged at "+this.showValue(value, "MiB", "MiB");
	}
	
	// %%% Do stuff %%%

	this.resizePartitionButton.mojo.deactivate();

	this.resizePartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.resizePartitionButtonModel);
};

MainAssistant.prototype.mountPartitionTap = function(event)
{
	var name = this.targetPartition;

	this.status.innerHTML = "Mounting "+this.partitionNames[name]+" ...";
	
	switch (name) {
	case "media":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["media"] = true;
			this.mountPartitionButton.mojo.deactivate();
			this.refresh();
		}
		else {
			this.request = TailorService.mountMedia(this.mountPartitionHandler);
		}
		break;
	case "ext3fs":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["ext3fs"] = true;
			this.mountPartitionButton.mojo.deactivate();
			this.refresh();
		}
		else {
			this.request = TailorService.mountExt3fs(this.mountPartitionHandler);
		}
		break;
	default:
		// Should never happen
		this.mountPartitionButton.mojo.deactivate();
		break;
	}
}

MainAssistant.prototype.mountPartition = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error mounting "+this.partitionNames[this.targetPartition]+" ...";
		this.errorMessage('<b>Service Error (mountPartition):</b><br>'+payload.errorText, payload.stdErr);
	}

	this.mountPartitionButton.mojo.deactivate();
	this.refresh();
};

MainAssistant.prototype.initialPartitionSizeChanged = function(event)
{
	this.createValue = event.value || 0;

	var partitionFreeSpace = this.partitionSize[this.targetPartition] - this.createValue + this.freeSpace;
	if (partitionFreeSpace > 0) {
		this.freeSpaceModel.title = partitionFreeSpace + " MiB";
	}
	else {
		this.freeSpaceModel.title = "None";
	}
	this.controller.modelChanged(this.freeSpaceModel);
	this.volumeList.mojo.noticeUpdatedItems(0, this.volumesModel.items);
	
	if (event.value === "0") {
		this.status.innerHTML = "Tap 'Delete Partition' to begin.";
		this.createPartitionButtonModel.label = $L("Delete Partition");
		this.createPartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.createPartitionButtonModel);
	}
	else if ((this.createValue == 0) || (this.createValue == this.partitionSize[this.targetPartition])) {
		this.status.innerHTML = "Enter initial partition size ...";
		this.createPartitionButtonModel.label = $L("Create Partition");
		this.createPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.createPartitionButtonModel);
	}
	else if (partitionFreeSpace < 0) {
		this.status.innerHTML = "Not enough free space!";
		this.createPartitionButtonModel.label = $L("No Free Space");
		this.createPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.createPartitionButtonModel);
	}
	else {
		this.status.innerHTML = "Tap 'Create Partition' to begin.";
		this.createPartitionButtonModel.label = $L("Create Partition");
		this.createPartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.createPartitionButtonModel);
	}
};

MainAssistant.prototype.createPartitionTap = function(event)
{
	this.initialPartitionSizeField.mojo.blur();

	var name = this.targetPartition;
	var value = this.initialPartitionSizeModel.value;

	if (value == "0") {
		this.status.innerHTML = "Removing "+this.partitionNames[name];
	}
	else if (value < this.partitionSize[name]) {
		this.status.innerHTML = "Reducing to "+this.showValue(value, "MiB", "MiB");
	}
	else if (value > this.partitionSize[name]) {
		this.status.innerHTML = "Extending to "+this.showValue(value, "MiB", "MiB");
	}
	else {
		this.status.innerHTML = "Unchanged at "+this.showValue(value, "MiB", "MiB");
	}
	
	// %%% Do stuff %%%

	this.createPartitionButton.mojo.deactivate();

	this.createPartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.createPartitionButtonModel);
};

MainAssistant.prototype.initialFilesystemSizeChanged = function(event)
{
	this.createValue = event.value || 0;

	var filesystemFreeSpace = (this.filesystemSize[this.targetPartition]
							   - this.createValue
							   + this.filesystemFree[this.targetPartition]);
	
	if (event.value === "0") {
		this.status.innerHTML = "Tap 'Delete Filesystem' to begin.";
		this.createFilesystemButtonModel.label = $L("Delete Filesystem");
		this.createFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.createFilesystemButtonModel);
	}
	else if ((this.createValue == 0) || (this.createValue == this.filesystemSize[this.targetPartition])) {
		this.status.innerHTML = "Enter initial filesystem size ...";
		this.createFilesystemButtonModel.label = $L("Create Filesystem");
		this.createFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.createFilesystemButtonModel);
	}
	else if (filesystemFreeSpace < 0) {
		this.status.innerHTML = "Not enough free space!";
		this.createFilesystemButtonModel.label = $L("No Free Space");
		this.createFilesystemButtonModel.disabled = true;
		this.controller.modelChanged(this.createFilesystemButtonModel);
	}
	else {
		this.status.innerHTML = "Tap 'Create Filesystem' to begin.";
		this.createFilesystemButtonModel.label = $L("Create Filesystem");
		this.createFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.createFilesystemButtonModel);
	}
};

MainAssistant.prototype.createFilesystemTap = function(event)
{
	var name = this.targetPartition;
	var value = this.initialFilesystemSizeModel.value;

	this.initialFilesystemSizeField.mojo.blur();

	if (value == "0") {
		this.status.innerHTML = "Removing "+this.partitionNames[name];
	}
	else if (value < this.filesystemSize[name]) {
		this.status.innerHTML = "Reducing to "+this.showValue(value, "MiB", "MiB");
	}
	else if (value > this.filesystemSize[name]) {
		this.status.innerHTML = "Extending to "+this.showValue(value, "MiB", "MiB");
	}
	else {
		this.status.innerHTML = "Unchanged at "+this.showValue(value, "MiB", "MiB");
	}
	
	// %%% Do stuff %%%

	this.createFilesystemButton.mojo.deactivate();

	this.createFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.createFilesystemButtonModel);

	if (this.filesystemFree[this.targetPartition]) {
		this.initialPartitionSizeModel.disabled = false;
		this.initialPartitionSizeModel.value = this.partitionSize[this.targetPartition];
		this.controller.modelChanged(this.initialPartitionSizeModel);
		this.initialPartitionSizeChanged({value: this.initialPartitionSizeModel.value});
		this.initialPartitionSizeField.mojo.focus();
	}
	else {
		this.initialPartitionSizeModel.disabled = true;
		this.controller.modelChanged(this.initialPartitionSizeModel);
		this.createPartitionButtonModel.label = $L("Cannot Create Partition");
		this.createPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.createPartitionButtonModel);
		this.initialPartitionSizeField.mojo.blur();
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

MainAssistant.prototype.showValue = function(value, units, maxunits)
{
	while ((value > 1024) || (value < -1024)) {
		value = value / 1024;
		switch (units) {
		case "B": units = "KiB"; break;
		case "KiB": units = "MiB"; break;
		case "MiB": units = "GiB"; break;
		}
		if (units == maxunits) break;
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
	this.controller.stopListening(this.partitionActivity, Mojo.Event.propertyChange, this.targetActivityChangedHandler);
	this.controller.stopListening(this.unmountPartitionButton, Mojo.Event.tap, this.unmountPartitionTapHandler);
	this.controller.stopListening(this.checkFilesystemButton,  Mojo.Event.tap, this.checkFilesystemTapHandler);
	this.controller.stopListening(this.newFilesystemSizeField, Mojo.Event.propertyChange, this.newFilesystemSizeChangedHandler);
	this.controller.stopListening(this.resizeFilesystemButton,  Mojo.Event.tap, this.resizeFilesystemTapHandler);
	this.controller.stopListening(this.newPartitionSizeField, Mojo.Event.propertyChange, this.newPartitionSizeChangedHandler);
	this.controller.stopListening(this.resizePartitionButton,  Mojo.Event.tap, this.resizePartitionTapHandler);
	this.controller.stopListening(this.mountPartitionButton, Mojo.Event.tap, this.mountPartitionTapHandler);
	this.controller.stopListening(this.initialPartitionSizeField, Mojo.Event.propertyChange, this.initialPartitionSizeChangedHandler);
	this.controller.stopListening(this.createPartitionButton,  Mojo.Event.tap, this.createPartitionTapHandler);
	this.controller.stopListening(this.initialFilesystemSizeField, Mojo.Event.propertyChange, this.initialFilesystemSizeChangedHandler);
	this.controller.stopListening(this.createFilesystemButton,  Mojo.Event.tap, this.createFilesystemTapHandler);
	this.controller.stopListening(this.mediaMountButton,  Mojo.Event.tap, this.mediaMountTapHandler);
	this.controller.stopListening(this.ext3fsMountButton,  Mojo.Event.tap, this.ext3fsMountTapHandler);
	this.controller.stopListening(this.optwareMountButton,  Mojo.Event.tap, this.optwareMountTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
