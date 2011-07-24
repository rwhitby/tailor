function MainAssistant()
{
	// subtitle random list
	this.randomSub =
		[
		 {weight: 30, text: $L('Tailoring the storage on your device')},
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

	// setup list model
	this.mainModel = {items:[]};
	
	this.newNameModel = { choices: [], disabled: true };

	this.newValueModel = { disabled: true };

	this.resizeButtonModel = {
		label: $L("Resize Partition"),
		disabled: true
	};

	this.totalSpace = 0;
	this.freeSpace = 0;
	this.peSize = 0;
	this.resizeName = false;
	this.partitionSizes = {
		"media":"0",
		"swap":"0",
		"ext3fs":"0",
		"foo":"0"
	};

	this.partitionNames = {
		"media":"USB (media)",
		"swap":"Swap",
		"ext3fs":"User (ext3)",
		"foo":"Foo (foo)"
	};
};

MainAssistant.prototype.setup = function()
{
	// setup menu
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// get elements
	this.iconElement =		this.controller.get('icon');
	this.titleElement =		this.controller.get('main-title');
	this.versionElement =	this.controller.get('version');
	this.subTitleElement =	this.controller.get('subTitle');

	this.overlay = 			this.controller.get('overlay'); this.overlay.hide();
	this.spinnerElement = 	this.controller.get('spinner');

	this.listElement =		this.controller.get('mainList');

	this.newSizeTitle =		this.controller.get('newSizeTitle');
	this.newNameElement =	this.controller.get('newName');
	this.newValueElement =	this.controller.get('newValue');
	this.resizeButton =		this.controller.get('resizeButton');

	this.statusTitle = 		this.controller.get('statusTitle');
	this.status = 			this.controller.get('status');
	
	// set version string random subtitle
	this.titleElement.innerHTML = Mojo.Controller.appInfo.title;
	this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
	this.subTitleElement.innerHTML = this.getRandomSubTitle();
	
	// setup handlers
	this.listGroupsHandler = this.listGroups.bindAsEventListener(this);
	this.listVolumesHandler = this.listVolumes.bindAsEventListener(this);
	this.volumeTappedHandler = this.volumeTapped.bindAsEventListener(this);
	this.newNameChangedHandler =  this.newNameChanged.bindAsEventListener(this);
	this.newValueChangedHandler =  this.newValueChanged.bindAsEventListener(this);
	this.resizeTapHandler = this.resizeTap.bindAsEventListener(this);

	// setup widgets
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, this.spinnerModel);

    this.controller.setupWidget('mainList', {
			itemTemplate: "main/rowTemplate", swipeToDelete: false, reorderable: false }, this.mainModel);
	this.controller.listen(this.listElement, Mojo.Event.listTap, this.volumeTappedHandler);

	this.controller.setupWidget('newName', { label: "Partition" }, this.newNameModel);
	this.controller.listen(this.newNameElement, Mojo.Event.propertyChange, this.newNameChangedHandler);
	this.controller.setupWidget('newValue', {
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
	this.controller.listen(this.newValueElement, Mojo.Event.propertyChange, this.newValueChangedHandler);
	this.controller.setupWidget('resizeButton', { type: Mojo.Widget.activityButton }, this.resizeButtonModel);
	this.controller.listen(this.resizeButton, Mojo.Event.tap, this.resizeTapHandler);

};

MainAssistant.prototype.activate = function()
{
	this.refresh();
};

MainAssistant.prototype.refresh = function()
{
	this.overlay.show();
	this.mainModel.items = [];
	this.statusTitle.innerHTML = "Partition Status";
	this.status.innerHTML = "Reading partition sizes ...";
	this.newNameModel.disabled = true;
	this.controller.modelChanged(this.newNameModel);
	this.newValueModel.disabled = true;
	this.controller.modelChanged(this.newValueModel);
	this.resizeButtonModel.disabled = true;
	this.controller.modelChanged(this.resizeButtonModel);
	this.request = TailorService.listGroups(this.listGroupsHandler);
};

MainAssistant.prototype.listGroups = function(payload)
{
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listGroups):</b><br>'+payload.errorText);
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
	if (payload.returnValue === false) {
		this.errorMessage('<b>Service Error (listVolumes):</b><br>'+payload.errorText);
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
					this.mainModel.items.push({label: this.partitionNames[name]+" Partition:", title: this.showValue(size, "MB"), name: name, labelClass: 'left', titleClass: 'right'});
				}
			}
		}
	}

	this.listElement.mojo.noticeUpdatedItems(0, this.mainModel.items);
	this.listElement.mojo.setLength(this.mainModel.items.length);

	this.newNameModel.choices = [];
	for (var f in this.partitionSizes) {
		this.newNameModel.choices.push({"label":this.partitionNames[f], "value":f});
	}
	this.newNameModel.value = this.newNameModel.choices[0].label;
	this.newNameModel.disabled = false;
	this.controller.modelChanged(this.newNameModel);

	this.newNameChanged({value:this.newNameModel.choices[0].value});

	this.overlay.hide();
};

MainAssistant.prototype.volumeTapped = function(event)
{
	this.newNameModel.value = this.partitionNames[event.item.name];
	this.controller.modelChanged(this.newNameModel);
	this.newNameChanged({value:event.item.name});
};

MainAssistant.prototype.newNameChanged = function(event)
{
	this.resizeName = event.value;
	this.newValueModel.value = this.partitionSizes[this.resizeName];
	this.newValueModel.disabled = false;
	this.controller.modelChanged(this.newValueModel);

	this.statusTitle.innerHTML = this.partitionNames[this.resizeName]+" Partition Status";

	this.newValueChanged({value: this.newValueModel.value});
};

MainAssistant.prototype.newValueChanged = function(event)
{
	this.resizeValue = event.value || 0;

	var newFreeSpace = this.partitionSizes[this.resizeName] - this.resizeValue + this.freeSpace;
	if (newFreeSpace >= 0) {
		this.newSizeTitle.innerHTML = "Partition Sizing ("+newFreeSpace + " MB free)";
	}
	else {
		this.newSizeTitle.innerHTML = "Partition Sizing (No free space)";
	}
	
	if ((this.resizeValue == 0) || (this.resizeValue == this.partitionSizes[this.resizeName])) {
		this.status.innerHTML = "Select partition and new size ...";
		this.resizeButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeButtonModel);
	}
	else if (newFreeSpace < 0) {
		this.status.innerHTML = "Not enough free space!";
		this.resizeButtonModel.disabled = true;
		this.controller.modelChanged(this.resizeButtonModel);
	}
	else {
		this.status.innerHTML = "Tap 'Resize Partition' to begin.";
		this.resizeButtonModel.disabled = false;
		this.controller.modelChanged(this.resizeButtonModel);
	}
};

MainAssistant.prototype.resizeTap = function(event)
{
	var name = this.resizeName;
	var value = this.newValueModel.value;

	if (value < this.partitionSizes[name]) {
		this.status.innerHTML = "Reduced to "+this.showValue(value, "MB");
	}
	else if (value > this.partitionSizes[name]) {
		this.status.innerHTML = "Extended to "+this.showValue(value, "MB");
	}
	else {
		this.status.innerHTML = "Unchanged at "+this.showValue(value, "MB");
	}
	
	// %%% Do stuff %%%

	this.resizeButton.mojo.deactivate();
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
		case "B": units = "kB"; break;
		case "kB": units = "MB"; break;
		case "MB": units = "GB"; break;
		}
	}
	return Math.round(value*1000)/1000+" "+units;
}

MainAssistant.prototype.onlyNumbers = function (charCode)
{
	if (charCode > 47 && charCode < 58) {
		return true;
	}
	return false;
}

MainAssistant.prototype.errorMessage = function(msg)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				'Tailor',
			message:			msg,
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
	this.controller.stopListening(this.listElement, Mojo.Event.listTap, this.volumeTappedHandler);
	this.controller.stopListening(this.newNameElement, Mojo.Event.propertyChange, this.newNameChangedHandler);
	this.controller.stopListening(this.newValueElement, Mojo.Event.propertyChange, this.newValueChangedHandler);
	this.controller.stopListening(this.resizeButton,  Mojo.Event.tap, this.resizeTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
