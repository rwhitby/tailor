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
		buttonClass: 'affirmative',
		disabled: true
	};

	this.checkFilesystemButtonModel = {
		label: $L("Check Filesystem"),
		buttonClass: 'affirmative',
		disabled: true
	};

	this.repairFilesystemButtonModel = {
		label: $L("Repair Filesystem"),
		buttonClass: 'negative',
		disabled: true
	};

	this.corruptFilesystemButtonModel = {
		label: $L("Corrupt Filesystem"),
		buttonClass: 'negative',
		disabled: true
	};

	this.newPartitionSizeModel = { disabled: true };

	this.resizePartitionButtonModel = {
		label: $L("Resize Partition"),
		buttonClass: 'negative',
		disabled: true
	};

	this.mountPartitionButtonModel = {
		label: $L("Mount Partition"),
		buttonClass: 'affirmative',
		disabled: true
	};

	this.initialPartitionNameModel = { choices: [], disabled: true };

	this.initialPartitionSizeModel = { disabled: true };

	this.createPartitionButtonModel = {
		label: $L("Create Partition"),
		buttonClass: 'negative',
		disabled: true
	};

	this.deletePartitionButtonModel = {
		label: $L("Delete Partition"),
		buttonClass: 'negative',
		disabled: true
	};

	// setup mounts model
	this.mountsModel = {items:[]};
	
	this.totalSpace = 0;
	this.freeSpace = 0;
	this.peSize = 0;
	this.targetPartition = false;
	this.targetActivity = false;

	this.partitions = [ "media", "ext3fs", "cm-system", "cm-cache", "cm-data", "luneos-root" ];

	this.partitionNames = {
		"unused":"Unused Space",
		"media":"USB (media)",
		"ext3fs":"User (ext3)",
		"cm-system":"Android (system)",
		"cm-cache":"Android (cache)",
		"cm-data":"Android (data)",
		"luneos-root": "LuneOS"
	};

	this.mountNames = {
		"/dev/mapper/store-media":"USB (media)",
		"/dev/mapper/store-ext3fs":"User (ext3)",
		"/dev/mapper/store-cm--system":"Android (system)",
		"/dev/mapper/store-cm--cache":"Android (cache)",
		"/dev/mapper/store-cm--data":"Android (data)",
		"/dev/mapper/store-luneos--root":"LuneOS",
		"/dev/store/luneos-root":"LuneOS"
	};

	this.partitionSize = false;
	this.filesystemCheck = false;
	this.filesystemRepair = false;
	this.filesystemSize = false;
	this.filesystemUsed = false;
	this.filesystemFree = false;
	this.partitionMounts = false;
	this.mountPoints = false;

	this.rebootRequired = false;

	this.timer = false;
	this.heartbeatValue = "*";

	this.emulatorMountState = {
		"media": true,
		"ext3fs" : false,
		"cm-system" : false,
		"cm-cache" : false,
		"cm-data" : false,
		"luneos-root": false
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

	this.statusGroup = 		this.controller.get('statusGroup');
	this.status = 			this.controller.get('status');
	
	this.activityTitle =	this.controller.get('activityTitle');

	this.partitionActivity = this.controller.get('partitionActivity');

	this.partitionSizeRow =		this.controller.get('partitionSizeRow');
	this.partitionSizeField =	this.controller.get('partitionSize');
	this.filesystemSizeRow =	this.controller.get('filesystemSizeRow');
	this.filesystemSizeField =	this.controller.get('filesystemSize');
	this.filesystemUsedRow =	this.controller.get('filesystemUsedRow');
	this.filesystemUsedField =	this.controller.get('filesystemUsed');
	this.filesystemFreeRow =	this.controller.get('filesystemFreeRow');
	this.filesystemFreeField =	this.controller.get('filesystemFree');

	this.unmountPartitionGroup = this.controller.get('unmount-partition-group');
	this.unmountPartitionTitle = this.controller.get('unmount-partition-title');
	this.unmountPartitionButton = this.controller.get('unmountPartitionButton');

	this.checkFilesystemGroup =   this.controller.get('check-filesystem-group');
	this.checkFilesystemTitle =   this.controller.get('check-filesystem-title');
	this.checkFilesystemButton =   this.controller.get('checkFilesystemButton');

	this.repairFilesystemGroup =   this.controller.get('repair-filesystem-group');
	this.repairFilesystemTitle =   this.controller.get('repair-filesystem-title');
	this.repairFilesystemButton =   this.controller.get('repairFilesystemButton');

	this.corruptFilesystemGroup =   this.controller.get('corrupt-filesystem-group');
	this.corruptFilesystemTitle =   this.controller.get('corrupt-filesystem-title');
	this.corruptFilesystemButton =   this.controller.get('corruptFilesystemButton');

	this.resizePartitionGroup =   this.controller.get('resize-partition-group');
	this.resizePartitionTitle =   this.controller.get('resize-partition-title');
	this.newPartitionSizeField =	this.controller.get('newPartitionSize');
	this.resizePartitionButton =   this.controller.get('resizePartitionButton');

	this.mountPartitionGroup =   this.controller.get('mount-partition-group');
	this.mountPartitionTitle =   this.controller.get('mount-partition-title');
	this.mountPartitionButton =   this.controller.get('mountPartitionButton');

	this.createPartitionGroup =   this.controller.get('create-partition-group');
	this.createPartitionTitle =   this.controller.get('create-partition-title');
	this.initialPartitionName =	this.controller.get('initialPartitionName');
	this.initialPartitionSizeField =	this.controller.get('initialPartitionSize');
	this.createPartitionButton =   this.controller.get('createPartitionButton');

	this.deletePartitionGroup =   this.controller.get('delete-partition-group');
	this.deletePartitionTitle =   this.controller.get('delete-partition-title');
	this.deletePartitionButton =   this.controller.get('deletePartitionButton');

	this.mountList =		this.controller.get('mountList');

	// set version string random subtitle
	this.titleElement.innerHTML = Mojo.Controller.appInfo.title;
	this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
	this.heartbeatElement.innerHTML = this.heartbeatValue;
	this.subTitleElement.innerHTML = this.getRandomSubTitle();
	
	// setup handlers
	this.userIdHandler = this.userId.bindAsEventListener(this);
	this.listGroupsHandler = this.listGroups.bindAsEventListener(this);
	this.listVolumesHandler = this.listVolumes.bindAsEventListener(this);
	this.volumeTappedHandler = this.volumeTapped.bindAsEventListener(this);
	this.targetActivityChangedHandler =  this.targetActivityChanged.bindAsEventListener(this);
	this.unmountPartitionTapHandler = this.unmountPartitionTap.bindAsEventListener(this);
	this.unmountPartitionHandler = this.unmountPartition.bindAsEventListener(this);
	this.checkFilesystemTapHandler = this.checkFilesystemTap.bindAsEventListener(this);
	this.checkMediaHandler = this.checkMedia.bindAsEventListener(this);
	this.checkExt3fsHandler = this.checkExt3fs.bindAsEventListener(this);
	this.repairFilesystemTapHandler = this.repairFilesystemTap.bindAsEventListener(this);
	this.repairMediaHandler = this.repairMedia.bindAsEventListener(this);
	this.repairExt3fsHandler = this.repairExt3fs.bindAsEventListener(this);
	this.corruptFilesystemTapHandler = this.corruptFilesystemTap.bindAsEventListener(this);
	this.corruptFilesystemHandler = this.corruptFilesystem.bindAsEventListener(this);
	this.newPartitionSizeChangedHandler =  this.newPartitionSizeChanged.bindAsEventListener(this);
	this.resizePartitionTapHandler = this.resizePartitionTap.bindAsEventListener(this);
	this.resizePartitionHandler = this.resizePartition.bindAsEventListener(this);
	this.resizeFilesystemHandler = this.resizeFilesystem.bindAsEventListener(this);
	this.mountPartitionTapHandler = this.mountPartitionTap.bindAsEventListener(this);
	this.mountPartitionHandler = this.mountPartition.bindAsEventListener(this);
	this.initialPartitionSizeChangedHandler =  this.initialPartitionSizeChanged.bindAsEventListener(this);
	this.createPartitionTapHandler = this.createPartitionTap.bindAsEventListener(this);
	this.createPartitionHandler = this.createPartition.bindAsEventListener(this);
	this.createFilesystemHandler = this.createFilesystem.bindAsEventListener(this);
	this.deletePartitionTapHandler = this.deletePartitionTap.bindAsEventListener(this);
	this.deletePartitionHandler = this.deletePartition.bindAsEventListener(this);
	this.listMountsHandler = this.listMounts.bindAsEventListener(this);
	this.mountTappedHandler = this.mountTapped.bindAsEventListener(this);
	this.unmountedHandler = this.unmounted.bindAsEventListener(this);

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
	this.controller.setupWidget('repairFilesystemButton', { type: Mojo.Widget.activityButton }, this.repairFilesystemButtonModel);
	this.controller.listen(this.repairFilesystemButton, Mojo.Event.tap, this.repairFilesystemTapHandler);
	this.controller.setupWidget('corruptFilesystemButton', { type: Mojo.Widget.activityButton }, this.corruptFilesystemButtonModel);
	this.controller.listen(this.corruptFilesystemButton, Mojo.Event.tap, this.corruptFilesystemTapHandler);

	this.controller.setupWidget('newPartitionSize', {
			autoFocus: false,
				autoReplace: false,
				// hintText: 'Enter new partition size ...',
				// multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				// maxLength: 6,
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

	this.controller.setupWidget('initialPartitionName', { label: "Partition" }, this.initialPartitionNameModel);

	this.controller.setupWidget('initialPartitionSize', {
			autoFocus: false,
				autoReplace: false,
				// hintText: 'Enter initial partition size ...',
				// multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				// maxLength: 6,
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

	this.controller.setupWidget('deletePartitionButton', { type: Mojo.Widget.activityButton }, this.deletePartitionButtonModel);
	this.controller.listen(this.deletePartitionButton, Mojo.Event.tap, this.deletePartitionTapHandler);

	this.controller.setupWidget('mountPartitionButton', { type: Mojo.Widget.activityButton }, this.mountPartitionButtonModel);
	this.controller.listen(this.mountPartitionButton, Mojo.Event.tap, this.mountPartitionTapHandler);

    this.controller.setupWidget('mountList', {
			itemTemplate: "main/rowTemplate", swipeToDelete: false, reorderable: false }, this.mountsModel);
	this.controller.listen(this.mountList, Mojo.Event.listTap, this.mountTappedHandler);
};

MainAssistant.prototype.activate = function()
{
	this.timer = this.controller.window.setInterval(this.heartbeatTick.bind(this), 1000);
	this.refresh(true);
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

MainAssistant.prototype.refresh = function(clearFilesystems)
{
	this.overlay.show();

	this.partitionSize = {
		"media":"0",
		"ext3fs":"0",
		"cm-system":"0",
		"cm-cache":"0",
		"cm-data":"0",
		"luneos-root": 0
	};
	this.partitionMounts = {
		"media":[],
		"ext3fs":[],
		"cm-system":[],
		"cm-cache":[],
		"cm-data":[],
		"luneos-root":[]
	};
	this.mountPoints = {
		"/media/internal": false,
		"/media/ext3fs": false,
		"/opt": false,
		"/media/luneos-root": false
	};

	if (clearFilesystems) {
		this.filesystemCheck = {
			"media":false,
			"ext3fs":false,
			"cm-system":false,
			"cm-cache":false,
			"cm-data":false,
			"luneos-root":false
		};
		this.filesystemRepair = {
			"media":false,
			"ext3fs":false,
			"cm-system":false,
			"cm-cache":false,
			"cm-data":false,
			"luneos-root":false
		};
		this.filesystemSize = {
			"media":false,
			"ext3fs":false,
			"cm-system":false,
			"cm-cache":false,
			"cm-data":false,
			"luneos-root":false
		};
		this.filesystemUsed = {
			"media":false,
			"ext3fs":false,
			"cm-system":false,
			"cm-cache":false,
			"cm-data":false,
			"luneos-root":false
		};
		this.filesystemFree = {
			"media":false,
			"ext3fs":false,
			"cm-system":false,
			"cm-cache":false,
			"cm-data":false,
			"luneos-root":false
		};
	}

	this.volumesModel.items = [];
	this.partitionSizeField.innerHTML =	"Unknown";
	this.filesystemSizeField.innerHTML = "Unknown";
	this.filesystemUsedField.innerHTML = "Unknown";
	this.filesystemFreeField.innerHTML = "Unknown";

	this.targetActivityModel.disabled = true;
	this.controller.modelChanged(this.targetActivityModel);

	this.mountsModel.items = [];

	this.rebootRequired = false;

	this.status.innerHTML = "Checking user id ...";
	this.request = TailorService.userId(this.userIdHandler);
};

MainAssistant.prototype.userId = function(payload)
{
	if (payload.returnValue === false) {
		this.status.innerHTML = "Error reading user id ...";
		this.errorMessage('<b>Service Error (userId):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
		return;
	}

	if (payload.userId !== "0") {
		this.status.innerHTML = "Reboot Required";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		this.errorMessage('<b>Installation Error:</b><br>Tailor has not been installed correctly. Reboot and run Tailor again to fix this issue. If that does not fix it, reinstall Tailor and then run it again.');
		this.overlay.hide();
		this.targetActivity = "Reboot Required";
		this.targetActivityModel.value = this.targetActivity;
		this.targetActivityModel.disabled = true;
		this.controller.modelChanged(this.targetActivityModel);
		this.rebootRequired = true;
		return;
	}

	this.status.innerHTML = "Reading volume groups ...";
	this.request = TailorService.listGroups(this.listGroupsHandler);
};

MainAssistant.prototype.listGroups = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		payload.stdOut = [ "store:::::::::::15507456:8192:::111:" ];
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error reading volume groups ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
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
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
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
				}
			}
		}
	}

	this.updateVolumeList();

	// Do this after the mounts have been determined
	// this.targetActivityChanged({value:this.targetActivity});

	this.status.innerHTML = "Reading mounts ...";
	this.request = TailorService.listMounts(this.listMountsHandler);
};

MainAssistant.prototype.updateVolumeList = function()
{
	this.volumesModel.items = [];

	for (var i = 0; i < this.partitions.length; i++) {
		var name = this.partitions[i];
		if (this.partitionSize[name] > 0) {
			if (!this.targetPartition) {
				this.targetPartition = name;
			}
			var selectedClass = '';
			if (this.targetPartition == name) {
				selectedClass = 'selected';
			}
			var item = {label: this.partitionNames[name]+":", title: this.showValue(this.partitionSize[name], "MiB"), name: name, labelClass: 'left', titleClass: 'right', selectedClass: selectedClass };
			this.volumesModel.items.push(item);
		}
	}
			
	if (this.freeSpace) {
		this.freeSpaceModel.title = this.freeSpace +" MiB";
	}
	else {
		this.freeSpaceModel.title = "None";
	}

	if (!this.targetPartition) {
		this.targetPartition = "unused";
	}
	if (this.targetPartition == "unused") {
		this.freeSpaceModel.selectedClass = 'selected';
	}
	else {
		this.freeSpaceModel.selectedClass = '';
	}

	this.volumesModel.items.push(this.freeSpaceModel);

	this.volumeList.mojo.noticeUpdatedItems(0, this.volumesModel.items);
	this.volumeList.mojo.setLength(this.volumesModel.items.length);
};

MainAssistant.prototype.updateActivityList = function()
{
	this.targetActivityModel.choices = [];

	if (this.rebootRequired) {
		this.targetActivityModel.choices.push({'label':"Reboot Required", 'value':"Reboot Required"});
	}
	else if (this.targetPartition == "unused") {
		if (this.freeSpace > 0) {
			this.targetActivityModel.choices.push({'label':"Create Partition", 'value':"Create Partition"});
		}
	}
	else {
		if (this.partitionMounts[this.targetPartition] && this.partitionMounts[this.targetPartition].length) {
			this.targetActivityModel.choices.push({'label':"Unmount Partition", 'value':"Unmount Partition"});
		}
		else {
			if (this.filesystemRepair[this.targetPartition]) {
				this.targetActivityModel.choices.push({'label':"Check Filesystem", 'value':"Check Filesystem"});
				this.targetActivityModel.choices.push({'label':"Repair Filesystem", 'value':"Repair Filesystem"});
				this.targetActivityModel.choices.push({'label':"Delete Partition", 'value':"Delete Partition"});
			}
			else if (!this.filesystemCheck[this.targetPartition]) {
				this.targetActivityModel.choices.push({'label':"Mount Partition", 'value':"Mount Partition"});
				this.targetActivityModel.choices.push({'label':"Check Filesystem", 'value':"Check Filesystem"});
				this.targetActivityModel.choices.push({'label':"Corrupt Filesystem", 'value':"Corrupt Filesystem"});
				this.targetActivityModel.choices.push({'label':"Delete Partition", 'value':"Delete Partition"});
			}
			else {
				this.targetActivityModel.choices.push({'label':"Mount Partition", 'value':"Mount Partition"});
				this.targetActivityModel.choices.push({'label':"Check Filesystem", 'value':"Check Filesystem"});
				this.targetActivityModel.choices.push({'label':"Corrupt Filesystem", 'value':"Corrupt Filesystem"});
				this.targetActivityModel.choices.push({'label':"Resize Partition", 'value':"Resize Partition"});
				this.targetActivityModel.choices.push({'label':"Delete Partition", 'value':"Delete Partition"});
			}
		}
	}

	if (this.rebootRequired) {
		this.targetActivity = "Reboot Required";
	}

	this.targetActivityModel.value = this.targetActivity;
	if (!this.targetActivityModel.value) {
		this.targetActivity = this.targetActivityModel.value = this.targetActivityModel.choices[0].label;
	}

	this.targetActivityModel.disabled = (this.rebootRequired || (this.targetActivityModel.choices.length == 0));
	this.controller.modelChanged(this.targetActivityModel);
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
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		this.errorMessage('<b>Service Error (listMounts):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
		return;
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
						this.mountsModel.items.push({label: this.mountNames[mountSource], title: mountPoint, name: mountSource, labelClass: 'left', titleClass: 'right'});
					}

					if ((mountSource == "/dev/mapper/store-media") && this.partitionSize["media"]) {
						this.partitionMounts["media"].push(mountPoint);
						if (mountPoint.indexOf("/var/palm/jail/") != -1) {
							jailActive = true;
						}
					}
					if ((mountSource == "/dev/mapper/store-ext3fs") && this.partitionSize["ext3fs"]) {
						this.partitionMounts["ext3fs"].push(mountPoint);
					}
					if ((mountSource == "/dev/store/luneos-root" || mountSource == "/dev/mapper/store-luneos--root") && this.partitionSize["luneos-root"]) {
						this.partitionMounts["luneos-root"].push(mountPoint);
					}

				}
			}
		}
	}

	this.mountList.mojo.noticeUpdatedItems(0, this.mountsModel.items);
	this.mountList.mojo.setLength(this.mountsModel.items.length);

	this.status.innerHTML = "Ready";

	if (jailActive) {
		this.status.innerHTML = "Reboot Required";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		this.errorMessage("<b>Danger Will Robinson!</b><br>Jails are active. Reboot your device and then immediately relaunch only this program and no other applications before continuing.");
		this.targetActivityModel.disabled = true;
		this.controller.modelChanged(this.targetActivityModel);
		this.rebootRequired = true;
	}

	// This will enable or disable the buttons appropriately
	this.selectTargetPartition(this.targetPartition);

	this.overlay.hide();
};

MainAssistant.prototype.volumeTapped = function(event)
{
	if (event.item.name) {
		this.selectTargetPartition(event.item.name);
	}

	this.updateVolumeList();
};

MainAssistant.prototype.selectTargetPartition = function(name)
{
	this.targetPartition = name;

	this.updateActivityList();

	this.activityTitle.innerHTML = "Select Activity for "+this.partitionNames[this.targetPartition]+" ...";

	this.partitionSizeRow.className = 'palm-row last';
	this.filesystemSizeRow.style.display = 'none';
	this.filesystemUsedRow.style.display = 'none';
	this.filesystemFreeRow.style.display = 'none';

	if (this.targetPartition == 'unused') {
		this.partitionSizeField.innerHTML = this.freeSpace + " MiB";
	}
	else {
		this.partitionSizeField.innerHTML = this.partitionSize[this.targetPartition]+" MiB";
		if (this.filesystemCheck[this.targetPartition] && (this.filesystemSize[this.targetPartition] > 0)) {
			this.partitionSizeRow.className = 'palm-row';
			this.filesystemSizeRow.style.display = '';
			this.filesystemSizeField.innerHTML = this.filesystemSize[this.targetPartition] + " MiB";
			this.filesystemUsedRow.style.display = '';
			this.filesystemUsedField.innerHTML = this.filesystemUsed[this.targetPartition] + " MiB";
			this.filesystemFreeRow.style.display = '';
			this.filesystemFreeField.innerHTML = this.filesystemFree[this.targetPartition] + " MiB";
		}
	}
			
	if (this.rebootRequired) {
		this.targetActivity = "Reboot Required";
	}
	// Check if the partition is mounted or not
	else if (this.partitionMounts[this.targetPartition] && this.partitionMounts[this.targetPartition].length) {
		this.targetActivity = "Unmount Partition";
	}
	else {
		// Check if the partition has a non-zero size
		if (this.partitionSize[this.targetPartition] > 0) {
			if (this.filesystemRepair[this.targetPartition]) {
				this.targetActivity = "Repair Filesystem";
			}
			else if (this.filesystemCheck[this.targetPartition]) {
				if (this.filesystemSize[this.targetPartition] == 0) {
					this.targetActivity = "Create Filesystem";
				}
				else {
					this.targetActivity = "Mount Partition";
				}
			}
			else {
				this.targetActivity = "Check Filesystem";
			}
		}
		else if (this.freeSpace > 0) {
			this.targetActivity = "Create Partition";
		}
		else {
			this.targetActivity = "None Available";
		}
	}

	this.selectTargetActivity(this.targetActivity);
};

MainAssistant.prototype.selectTargetActivity = function(name)
{
	this.targetActivity = name;
	this.targetActivityModel.value = this.targetActivity;
	this.controller.modelChanged(this.targetActivityModel);
	this.targetActivityChanged({value:this.targetActivity});
};

MainAssistant.prototype.targetActivityChanged = function(event)
{
	this.targetActivity = event.value;

	this.unmountPartitionGroup.style.display = 'none';
	this.unmountPartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.unmountPartitionButtonModel);

	this.checkFilesystemGroup.style.display = 'none';
	this.checkFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.checkFilesystemButtonModel);

	this.repairFilesystemGroup.style.display = 'none';
	this.repairFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.repairFilesystemButtonModel);

	this.corruptFilesystemGroup.style.display = 'none';
	this.corruptFilesystemButtonModel.disabled = true;
	this.controller.modelChanged(this.corruptFilesystemButtonModel);

	this.resizePartitionGroup.style.display = 'none';
	this.newPartitionSizeModel.disabled = true;
	this.controller.modelChanged(this.newPartitionSizeModel);
	this.resizePartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.resizePartitionButtonModel);

	this.mountPartitionGroup.style.display = 'none';
	this.mountPartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.mountPartitionButtonModel);

	this.createPartitionGroup.style.display = 'none';
	this.initialPartitionNameModel.disabled = true;
	this.controller.modelChanged(this.initialPartitionNameModel);
	this.initialPartitionSizeModel.disabled = true;
	this.controller.modelChanged(this.initialPartitionSizeModel);
	this.createPartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.createPartitionButtonModel);

	this.deletePartitionGroup.style.display = 'none';
	this.deletePartitionButtonModel.disabled = true;
	this.controller.modelChanged(this.deletePartitionButtonModel);

	if (this.targetActivity == "Unmount Partition") {
		this.unmountPartitionGroup.style.display = '';
		this.unmountPartitionTitle.innerHTML = $L("Unmount")+" "+this.partitionNames[this.targetPartition]+" "+$L("Partition");
		this.unmountPartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.unmountPartitionButtonModel);
	}
	else if (this.targetActivity == "Check Filesystem") {
		this.checkFilesystemGroup.style.display = '';
		this.checkFilesystemTitle.innerHTML = $L("Check")+" "+this.partitionNames[this.targetPartition]+" "+$L("Filesystem");
		this.checkFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.checkFilesystemButtonModel);
	}
	else if (this.targetActivity == "Repair Filesystem") {
		this.repairFilesystemGroup.style.display = '';
		this.repairFilesystemTitle.innerHTML = $L("Repair")+" "+this.partitionNames[this.targetPartition]+" "+$L("Filesystem");
		this.repairFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.repairFilesystemButtonModel);
	}
	else if (this.targetActivity == "Corrupt Filesystem") {
		this.corruptFilesystemGroup.style.display = '';
		this.corruptFilesystemTitle.innerHTML = $L("Corrupt")+" "+this.partitionNames[this.targetPartition]+" "+$L("Filesystem");
		this.corruptFilesystemButtonModel.disabled = false;
		this.controller.modelChanged(this.corruptFilesystemButtonModel);
	}
	else if (this.targetActivity == "Resize Partition") {
		this.resizePartitionGroup.style.display = '';
		this.resizePartitionTitle.innerHTML = $L("Resize")+" "+this.partitionNames[this.targetPartition]+" "+$L("Partition");
		this.newPartitionSizeModel.disabled = false;
		this.newPartitionSizeModel.value = this.partitionSize[this.targetPartition];
		this.controller.modelChanged(this.newPartitionSizeModel);
		this.newPartitionSizeChanged({value: this.newPartitionSizeModel.value});
		this.newPartitionSizeField.mojo.focus();
	}
	else if (this.targetActivity == "Mount Partition") {
		this.mountPartitionGroup.style.display = '';
		this.mountPartitionTitle.innerHTML = $L("Mount")+" "+this.partitionNames[this.targetPartition]+" "+$L("Partition");
		this.mountPartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.mountPartitionButtonModel);
	}
	else if (this.targetActivity == "Create Partition") {
		this.initialPartitionNameModel.choices = [];
		for (var i = 0; i < this.partitions.length; i++) {
			var name = this.partitions[i];
			if (this.partitionSize[name] == 0) {
				this.initialPartitionNameModel.choices.push({label: this.partitionNames[name], value: name});
			}
		}
		if (this.initialPartitionNameModel.choices.length > 0) {
			this.createPartitionGroup.style.display = '';
			this.initialPartitionNameModel.disabled = false;
			this.initialPartitionNameModel.value = this.initialPartitionNameModel.choices[0].value;
			this.controller.modelChanged(this.initialPartitionNameModel);
			this.initialPartitionSizeModel.disabled = false;
			this.initialPartitionSizeModel.value = this.freeSpace;
			this.controller.modelChanged(this.initialPartitionSizeModel);
			this.initialPartitionSizeChanged({value: this.initialPartitionSizeModel.value});
			this.initialPartitionSizeField.mojo.focus();
		}
		else {
			this.targetActivity = "None Available";
			this.selectTargetActivity(this.targetActivity);
			return;
		}
	}
	else if (this.targetActivity == "Delete Partition") {
		this.deletePartitionGroup.style.display = '';
		this.deletePartitionTitle.innerHTML = $L("Delete")+" "+this.partitionNames[this.targetPartition]+" "+$L("Partition");
		this.deletePartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.deletePartitionButtonModel);
	}

	this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
	if (Mojo.Environment.DeviceInfo.modelNameAscii.indexOf('TouchPad') == 0) {
		// Do it again after a second due to the keyboard opening
		this.controller.getSceneScroller().mojo.revealElement.delay(1, this.statusGroup);
	}
};

MainAssistant.prototype.unmountPartitionTap = function(event)
{
	this.overlay.show();

	this.status.innerHTML = "Unmounting "+this.partitionNames[this.targetPartition]+" ...";
	
	switch (this.targetPartition) {
	case "media":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["media"] = false;
			this.unmountPartitionButton.mojo.deactivate();
			this.refresh(true);
		}
		else {
			this.request = TailorService.unmountMedia(this.unmountPartitionHandler);
		}
		break;
	case "ext3fs":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["ext3fs"] = false;
			this.unmountPartitionButton.mojo.deactivate();
			this.refresh(true);
		}
		else {
			this.request = TailorService.unmountExt3fs(this.unmountPartitionHandler);
		}
		break;
	case "luneos-root":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["luneos-root"] = false;
			this.unmountPartitionButton.mojo.deactivate();
			this.refresh(true);
		}
		else {
			this.request = TailorService.unmountLuneOS(this.unmountPartitionHandler);
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
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		this.errorMessage('<b>Service Error (unmountPartition):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
	}

	this.unmountPartitionButton.mojo.deactivate();
	this.refresh(true);
};

MainAssistant.prototype.checkFilesystemTap = function(event)
{
	this.overlay.show();

	this.status.innerHTML = "Checking "+this.partitionNames[this.targetPartition]+" ...";
	
	if (this.targetPartition == "media") {
		this.request = TailorService.checkMedia(this.checkMediaHandler);
	}
	else if (this.targetPartition != "unused") {
		this.request = TailorService.checkExt3fs(this.checkExt3fsHandler, "/dev/store/"+this.targetPartition);
	}
}

MainAssistant.prototype.checkMedia = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stdOut = " "+this.partitionSize[this.targetPartition]*1024/8+" blocks used (50.0%)";
		payload.stage = "end";
	}

	if (payload.returnValue === false) {

		this.filesystemCheck[this.targetPartition] = false;
		this.filesystemRepair[this.targetPartition] = true;

		this.status.innerHTML = "Error checking "+this.partitionNames[this.targetPartition]+" ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.errorMessage('<b>Filesystem Check Failed</b><br>This is a potentially destructive situation for your data. You must either attempt to repair your filesystem or reboot and hope that webOS repairs it for you.');

		this.updateVolumeList();
		this.selectTargetPartition(this.targetPartition);

		this.checkFilesystemButton.mojo.deactivate();

		this.targetActivity = "Repair Filesystem";
		this.selectTargetActivity(this.targetActivity);

		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
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
				// Allow for a 1MB margin of calculation error
				if ((this.partitionSize[this.targetPartition] - totalSpace) < 1) {
					totalSpace = this.partitionSize[this.targetPartition];
				}
				var freeSpace = Math.floor(((matches[2]-matches[1])*this.clusterSize)/1048756);
				var usedSpace = totalSpace - freeSpace;
				// this.filesystemSizeField.innerHTML = totalSpace+" MiB";
				// this.filesystemUsedField.innerHTML = usedSpace+" MiB";
				// this.filesystemFreeField.innerHTML = freeSpace+" MiB";
				this.filesystemSize[this.targetPartition] = totalSpace;
				this.filesystemUsed[this.targetPartition] = usedSpace;
				this.filesystemFree[this.targetPartition] = freeSpace;
			}
		}
	}
	
	if (payload.stage == "end") {

		this.filesystemCheck[this.targetPartition] = true;
		this.filesystemRepair[this.targetPartition] = false;

		this.status.innerHTML = "Filesystem Check Passed";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.updateVolumeList();
		this.selectTargetPartition(this.targetPartition);

		this.checkFilesystemButton.mojo.deactivate();

		this.targetActivity = "Resize Partition";
		this.selectTargetActivity(this.targetActivity);

		this.overlay.hide();
	}
};

MainAssistant.prototype.checkExt3fs = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stdOut = "foo: 12/262144 files (0.0% non-contiguous), 51311/1048576 blocks";
		payload.stage = "end";
	}

	if (payload.returnValue === false) {

		if (payload.errorText.match(/Bad magic number in super-block/)) {
			this.status.innerHTML = "No filesystem found in "+this.partitionNames[this.targetPartition];
			this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
			this.filesystemCheck[this.targetPartition] = true;
			this.filesystemSize[this.targetPartition] = 0;
			this.filesystemUsed[this.targetPartition] = 0;
			this.filesystemFree[this.targetPartition] = 0;
		}
		else {
			this.status.innerHTML = "Error checking "+this.partitionNames[this.targetPartition]+" ...";
			this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
			this.errorMessage('<b>Filesystem Check Failed</b><br>This is a potentially destructive situation for your data. You must either attempt to repair your filesystem or reboot and hope that webOS repairs it for you.');
			this.filesystemCheck[this.targetPartition] = true;
			this.filesystemRepair[this.targetPartition] = true;
			this.filesystemSize[this.targetPartition] = false;
			this.filesystemUsed[this.targetPartition] = false;
			this.filesystemFree[this.targetPartition] = false;
		}

		this.updateVolumeList();
		this.selectTargetPartition(this.targetPartition);

		this.checkFilesystemButton.mojo.deactivate();

		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
		if (payload.stdOut.match(/.+ files .+ blocks/)) {
			var data = payload.stdOut.split(":", 2);
			var matches = data[1].match(/[0-9.]+/g);
			if (matches.length == 5) {
				var totalSpace = Math.ceil(4 * matches[4] / 1024);
				var usedSpace  = Math.ceil(4 * matches[3] / 1024);
				if ((totalSpace - this.partitionSize[this.targetPartition]) > 0) {
					totalSpace = Math.ceil(2 * matches[4] / 1024);
					usedSpace  = Math.ceil(2 * matches[3] / 1024);
				}
				if ((totalSpace - this.partitionSize[this.targetPartition]) > 0) {
					totalSpace = Math.ceil(1 * matches[4] / 1024);
					usedSpace  = Math.ceil(1 * matches[3] / 1024);
				}
				var freeSpace = totalSpace - usedSpace;
				// this.filesystemSizeField.innerHTML = totalSpace+" MiB";
				// this.filesystemUsedField.innerHTML = usedSpace+" MiB";
				// this.filesystemFreeField.innerHTML = freeSpace+" MiB";
				this.filesystemSize[this.targetPartition] = totalSpace;
				this.filesystemUsed[this.targetPartition] = usedSpace;
				this.filesystemFree[this.targetPartition] = freeSpace;
			}
		}
	}
	
	if (payload.stage == "end") {

		this.filesystemCheck[this.targetPartition] = true;
		this.filesystemRepair[this.targetPartition] = false;

		this.status.innerHTML = "Filesystem Check Passed";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.updateVolumeList();
		this.selectTargetPartition(this.targetPartition);

		this.checkFilesystemButton.mojo.deactivate();

		this.targetActivity = "Resize Partition";
		this.selectTargetActivity(this.targetActivity);

		this.overlay.hide();
	}
};

MainAssistant.prototype.repairFilesystemTap = function(event)
{
	this.overlay.show();

	this.status.innerHTML = "Repairing "+this.partitionNames[this.targetPartition]+" ...";
	
	this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

	if (this.targetPartition == "media") {
		this.request = TailorService.repairMedia(this.repairMediaHandler);
	}
	else if (this.targetPartition != "unused") {
		this.request = TailorService.repairExt3fs(this.repairExt3fsHandler, "/dev/store/"+this.targetPartition);
	}
}

MainAssistant.prototype.repairMedia = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error repairing "+this.partitionNames[this.targetPartition]+" ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		// this.errorMessage('<b>Service Error (repairFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Filesystem Repair Failed</b><br>Note that it usually takes two attempts to repair a filesystem, so try again if this was the first attempt.');
		this.repairFilesystemButton.mojo.deactivate();
		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {

		this.filesystemCheck[this.targetPartition] = false;
		this.filesystemRepair[this.targetPartition] = false;

		this.status.innerHTML = "Filesystem Repair Complete";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.updateVolumeList();
		this.selectTargetPartition(this.targetPartition);

		this.repairFilesystemButton.mojo.deactivate();

		this.targetActivity = "Check Filesystem";
		this.selectTargetActivity(this.targetActivity);

		this.overlay.hide();
	}
};

MainAssistant.prototype.repairExt3fs = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error repairing "+this.partitionNames[this.targetPartition]+" ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		// this.errorMessage('<b>Service Error (repairFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Filesystem Repair Failed</b><br>Note that it usually takes two attempts to repair a filesystem, so try again if this was the first attempt.');
		this.repairFilesystemButton.mojo.deactivate();
		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {

		this.filesystemCheck[this.targetPartition] = false;
		this.filesystemRepair[this.targetPartition] = false;

		this.status.innerHTML = "Filesystem Repair Complete";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.updateVolumeList();
		this.selectTargetPartition(this.targetPartition);

		this.repairFilesystemButton.mojo.deactivate();

		this.targetActivity = "Check Filesystem";
		this.selectTargetActivity(this.targetActivity);

		this.overlay.hide();
	}
};

MainAssistant.prototype.corruptFilesystemTap = function(event)
{
	this.overlay.show();

	this.status.innerHTML = "Corrupting "+this.partitionNames[this.targetPartition]+" ...";
	
	this.request = TailorService.corruptFilesystem(this.corruptFilesystemHandler, "/dev/store/"+this.targetPartition);
}

MainAssistant.prototype.corruptFilesystem = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error corrupting "+this.partitionNames[this.targetPartition]+" ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		// this.errorMessage('<b>Service Error (corruptFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Filesystem Corruption Failed</b>');
		this.corruptFilesystemButton.mojo.deactivate();
		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {

		this.filesystemCheck[this.targetPartition] = true;
		this.filesystemRepair[this.targetPartition] = true;
		this.filesystemSize[this.targetPartition] = false;
		this.filesystemUsed[this.targetPartition] = false;
		this.filesystemFree[this.targetPartition] = false;

		this.status.innerHTML = "Filesystem Corruption Complete";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.updateVolumeList();
		this.selectTargetPartition(this.targetPartition);

		this.corruptFilesystemButton.mojo.deactivate();

		this.targetActivity = "Repair Filesystem";
		this.selectTargetActivity(this.targetActivity);

		this.overlay.hide();
	}
};

MainAssistant.prototype.newPartitionSizeChanged = function(event)
{
	this.resizeValue = event.value || 0;

	// New size request smaller than filesystem size
	if ((this.resizeValue - this.filesystemUsed[this.targetPartition]) < 0) {
		this.resizePartitionButtonModel.label = $L("New Size Too Small");
		this.resizePartitionButtonModel.disabled = true;
	}
	// New size request larger than partition size plus free space
	else if ((this.resizeValue - this.partitionSize[this.targetPartition] - this.freeSpace) > 0) {
		this.resizePartitionButtonModel.label = $L("New Size Too Large");
		this.resizePartitionButtonModel.disabled = true;
	}
	// New size request not specified or same as current size
	else if ((this.resizeValue == 0) ||
			 (this.resizeValue == this.partitionSize[this.targetPartition])) {
		this.resizePartitionButtonModel.label = $L("Enter New Size");
		this.resizePartitionButtonModel.disabled = true;
	}
	else {
		this.resizePartitionButtonModel.label = $L("Resize Partition");
		this.resizePartitionButtonModel.disabled = false;
	}

	this.controller.modelChanged(this.resizePartitionButtonModel);
};

MainAssistant.prototype.resizePartitionTap = function(event)
{
	this.overlay.show();

	this.newPartitionSizeField.mojo.blur();

	var value = this.newPartitionSizeModel.value;
	var delta = this.partitionSize[this.targetPartition] - value;

	if (delta > 0) {
		this.status.innerHTML = ("Reducing filesystem to " + value + " MiB");
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		if (this.targetPartition == "media") {
			this.request = TailorService.resizeMedia(this.resizeFilesystemHandler, value);
		}
		else if (this.targetPartition != "unused") {
			this.request = TailorService.resizeExt3fs(this.resizeFilesystemHandler,
													  "/dev/store/"+this.targetPartition, value);
		}
	}
	else if (delta < 0) {
		this.status.innerHTML = ("Extending partition to " + value + " MiB");
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.resizePartitionOverrideError = false;
		this.request = TailorService.resizePartition(this.resizePartitionHandler,
													 "/dev/store/"+this.targetPartition, value);
	}
	else {
		this.status.innerHTML = "Unchanged at " + value + " MiB";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.resizePartitionButton.mojo.deactivate();
	}
};

MainAssistant.prototype.resizePartition = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		if (this.resizePartitionOverrideError) {
			payload = {};
			payload.returnValue = true;
			payload.stage = "end";
		}
		else {
			// this.errorMessage('<b>Service Error (resizePartition):</b><br>'+payload.errorText, [ payload.stdErr ]);
			this.errorMessage('<b>Partition Resizing Failed</b>');
			this.resizePartitionButton.mojo.deactivate();
			this.overlay.hide();
			return;
		}
	}

	if (payload.stdErr) {
		if (!payload.stdErr.match(/WARNING: Reducing active logical volume to/) &&
			!payload.stdErr.match(/THIS MAY DESTROY YOUR DATA/) &&
			!payload.stdErr.match(/leaked on lvresize invocation/) &&
			!payload.stdErr.match(/Run .* for more information/)) {
			this.status.innerHTML = payload.stdErr;
			// this.errorMessage(payload.stdErr);
		}
		if (payload.stdErr.match(/New size .* matches existing size/)) {
			this.resizePartitionOverrideError = true;
		}
	}
	else if (payload.stdOut) {
		if (!payload.stdOut.match(/Rounding up size to full physical extent/)) {
			this.status.innerHTML = payload.stdOut;
			// this.errorMessage(payload.stdOut);
		}
	}
	
	if (payload.stage == "end") {

		var value = this.newPartitionSizeModel.value;
		var delta = this.partitionSize[this.targetPartition] - value;

		this.partitionSize[this.targetPartition] = this.newPartitionSizeModel.value;

		if (delta < 0) {
			this.status.innerHTML = ("Extending filesystem to " + value + " MiB");
			this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

			if (this.targetPartition == "media") {
				this.request = TailorService.resizeMedia(this.resizeFilesystemHandler, value);
			}
			else if (this.targetPartition != "unused") {
				this.request = TailorService.resizeExt3fs(this.resizeFilesystemHandler,
														  "/dev/store/"+this.targetPartition, value);
			}
		}
		else {
			this.status.innerHTML = "Partition Resize Complete";
			this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

			this.updateVolumeList();
			this.selectTargetPartition(this.targetPartition);

			this.resizePartitionButton.mojo.deactivate();
			this.refresh(true);
		}
	}
};

MainAssistant.prototype.resizeFilesystem = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		// this.errorMessage('<b>Service Error (resizePartition):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Filesystem Resize Failed</b>');
		this.resizePartitionButton.mojo.deactivate();
		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		if (!payload.stdErr.match(/resize2fs/)) {
			this.status.innerHTML = payload.stdErr;
			// this.errorMessage(payload.stdErr);
		}
	}
	else if (payload.stdOut) {
		if (!payload.stdOut.match(/dosfsck/) &&
			!payload.stdOut.match(/percent complete/)) {
			this.status.innerHTML = payload.stdOut;
			// this.errorMessage(payload.stdOut);
		}
	}
	
	if (payload.stage == "end") {

		var value = this.newPartitionSizeModel.value;
		var delta = this.partitionSize[this.targetPartition] - value;

		if (delta > 0) {
			this.status.innerHTML = ("Reducing partition to " + value + " MiB");
			this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

			this.request = TailorService.resizePartition(this.resizePartitionHandler,
														 "/dev/store/"+this.targetPartition, value);
		}
		else {
			this.status.innerHTML = "Partition Resize Complete";
			this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

			this.updateVolumeList();
			this.selectTargetPartition(this.targetPartition);

			this.resizePartitionButton.mojo.deactivate();
			this.refresh(true);
		}
	}
};

MainAssistant.prototype.mountPartitionTap = function(event)
{
	this.overlay.show();

	this.status.innerHTML = "Mounting "+this.partitionNames[this.targetPartition]+" ...";
	
	switch (this.targetPartition) {
	case "media":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["media"] = true;
			this.mountPartitionButton.mojo.deactivate();
			this.refresh(true);
		}
		else {
			this.request = TailorService.mountMedia(this.mountPartitionHandler);
		}
		break;
	case "ext3fs":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["ext3fs"] = true;
			this.mountPartitionButton.mojo.deactivate();
			this.refresh(true);
		}
		else {
			this.request = TailorService.mountExt3fs(this.mountPartitionHandler);
		}
		break;
	case "luneos-root":
		if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
			this.emulatorMountState["luneos-root"] = true;
			this.mountPartitionButton.mojo.deactivate();
			this.refresh(true);
		}
		else {
			this.request = TailorService.mountLuneOS(this.mountPartitionHandler);
		}
		break;
	default:
		// Should never happen
		this.mountPartitionButton.mojo.deactivate();
		this.overlay.hide();
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
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		this.errorMessage('<b>Service Error (mountPartition):</b><br>'+payload.errorText, payload.stdErr);
		this.overlay.hide();
	}

	this.filesystemCheck[this.targetPartition] = false;
	this.filesystemRepair[this.targetPartition] = false;
	this.filesystemSize[this.targetPartition] = false;
	this.filesystemUsed[this.targetPartition] = false;
	this.filesystemFree[this.targetPartition] = false;

	this.mountPartitionButton.mojo.deactivate();
	this.refresh(true);
};

MainAssistant.prototype.initialPartitionSizeChanged = function(event)
{
	this.createValue = event.value || 0;

	var partitionFreeSpace = this.partitionSize[this.targetPartition] - this.createValue + this.freeSpace;
	
	if ((this.createValue == 0) || (this.createValue == this.partitionSize[this.targetPartition])) {
		this.createPartitionButtonModel.label = $L("Create Partition");
		this.createPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.createPartitionButtonModel);
	}
	else if (partitionFreeSpace < 0) {
		this.createPartitionButtonModel.label = $L("No Free Space");
		this.createPartitionButtonModel.disabled = true;
		this.controller.modelChanged(this.createPartitionButtonModel);
	}
	else {
		this.createPartitionButtonModel.label = $L("Create Partition");
		this.createPartitionButtonModel.disabled = false;
		this.controller.modelChanged(this.createPartitionButtonModel);
	}
};

MainAssistant.prototype.createPartitionTap = function(event)
{
	this.overlay.show();

	this.initialPartitionSizeField.mojo.blur();

	var name = this.initialPartitionNameModel.value;
	var value = this.initialPartitionSizeModel.value;

	this.status.innerHTML = "Creating " + name + " with size " + value + " MiB";
	
	this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

	this.targetPartition = name;

	this.request = TailorService.createPartition(this.createPartitionHandler, name, value);
};

MainAssistant.prototype.createPartition = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error creating "+this.partitionNames[this.targetPartition]+" ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		// this.errorMessage('<b>Service Error (createPartition):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Partition Creation Failed</b>');
		this.createPartitionButton.mojo.deactivate();
		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		if (!payload.stdErr.match(/leaked on lvcreate invocation/)) {
			this.status.innerHTML = payload.stdErr;
		}
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {

		this.status.innerHTML = "Partition Created";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.createPartitionButton.mojo.deactivate();
		
		this.filesystemCheck[this.targetPartition] = true;
		this.filesystemSize[this.targetPartition] = 0;

		if (this.targetPartition == "media") {
			this.request = TailorService.createMedia(this.createFilesystemHandler);
		}
		else if (this.targetPartition != "unused") {
			this.request = TailorService.createExt3fs(this.createFilesystemHandler, "/dev/store/"+this.targetPartition);
		}
	}
};

MainAssistant.prototype.createFilesystem = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error creating "+this.partitionNames[this.targetPartition]+" ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		// this.errorMessage('<b>Service Error (createFilesystem):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Filesystem Creation Failed</b>');
		this.createPartitionButton.mojo.deactivate();
		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		this.status.innerHTML = payload.stdErr;
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {

		this.status.innerHTML = "Filesystem Creation Complete";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.filesystemCheck[this.targetPartition] = false;
		this.filesystemSize[this.targetPartition] = false;
		this.filesystemUsed[this.targetPartition] = false;
		this.filesystemFree[this.targetPartition] = false;

		this.createPartitionButton.mojo.deactivate();
		this.refresh(true);
	}
};

MainAssistant.prototype.deletePartitionTap = function(event)
{
	this.overlay.show();

	this.status.innerHTML = "Removing "+this.partitionNames[this.targetPartition];

	this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

	this.request = TailorService.deletePartition(this.deletePartitionHandler,
												 "/dev/store/"+this.targetPartition);
};

MainAssistant.prototype.deletePartition = function(payload)
{
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator') {
		this.request.cancel();
		payload = {};
		payload.returnValue = true;
		payload.stage = "end";
	}

	if (payload.returnValue === false) {
		this.status.innerHTML = "Error deleting "+this.partitionNames[this.targetPartition]+" ...";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);
		// this.errorMessage('<b>Service Error (deletePartition):</b><br>'+payload.errorText, [ payload.stdErr ]);
		this.errorMessage('<b>Partition Deletion Failed</b>');
		this.deletePartitionButton.mojo.deactivate();
		this.overlay.hide();
		return;
	}

	if (payload.stdErr) {
		if (!payload.stdErr.match(/leaked on lvremove invocation/)) {
			this.status.innerHTML = payload.stdErr;
		}
	}
	else if (payload.stdOut) {
		this.status.innerHTML = payload.stdOut;
	}
	
	if (payload.stage == "end") {

		this.status.innerHTML = "Partition Deleted";
		this.controller.getSceneScroller().mojo.revealElement(this.statusGroup);

		this.targetPartition = "unused";

		this.deletePartitionButton.mojo.deactivate();
		this.refresh(true);
	}
};

MainAssistant.prototype.mountTapped = function(event)
{
	var mountSource = event.item.name;
	var mountPoint = event.item.title;

	if (mountPoint.indexOf("/var/palm/jail/") != -1) {
		this.request = TailorService.unmountBind(this.unmountedHandler, mountPoint);
	}
	else if (mountPoint.indexOf("/media/internal") != -1) {
		this.request = TailorService.unmountMedia(this.unmountedHandler);
	}
	else if (mountPoint.indexOf("/media/ext3fs") != -1) {
		this.request = TailorService.unmountExt3fs(this.unmountedHandler);
	}
	else if (mountPoint.indexOf("/opt") != -1) {
		this.request = TailorService.unmountOptware(this.unmountedHandler);
	}
	else if (mountPoint.indexOf("/media/luneos-root") != -1) {
		this.request = TailorService.unmountLuneOS(this.unmountedHandler);
	}
};

MainAssistant.prototype.unmounted = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (unmount):</b><br>'+payload.errorText, payload.stdErr);
	}

	this.refresh(true);
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
		if (units == maxunits) break;
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
		this.refresh(true);
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
	this.controller.stopListening(this.repairFilesystemButton,  Mojo.Event.tap, this.repairFilesystemTapHandler);
	this.controller.stopListening(this.corruptFilesystemButton,  Mojo.Event.tap, this.corruptFilesystemTapHandler);
	this.controller.stopListening(this.newPartitionSizeField, Mojo.Event.propertyChange, this.newPartitionSizeChangedHandler);
	this.controller.stopListening(this.resizePartitionButton,  Mojo.Event.tap, this.resizePartitionTapHandler);
	this.controller.stopListening(this.mountPartitionButton, Mojo.Event.tap, this.mountPartitionTapHandler);
	this.controller.stopListening(this.initialPartitionSizeField, Mojo.Event.propertyChange, this.initialPartitionSizeChangedHandler);
	this.controller.stopListening(this.createPartitionButton,  Mojo.Event.tap, this.createPartitionTapHandler);
	this.controller.stopListening(this.createFilesystemButton,  Mojo.Event.tap, this.createFilesystemTapHandler);
	this.controller.stopListening(this.mountList, Mojo.Event.listTap, this.mountTappedHandler);
};

// Local Variables:
// tab-width: 4
// End:
