function PreferencesAssistant()
{
	// setup default preferences in the preferenceCookie.js model
	this.cookie = new preferenceCookie();
	this.prefs = this.cookie.get();
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: $L("Help"),
				command: 'do-help'
			}
		]
	}

};

PreferencesAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		// get elements
		this.iconElement =			this.controller.get('icon');

		// setup handlers for preferences
		this.iconTapHandler = this.iconTap.bindAsEventListener(this);
		this.listChangedHandler  = this.listChanged.bindAsEventListener(this);
		
		this.controller.listen(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);

		// Global Group
		this.controller.setupWidget
		(
			'theme',
			{
				label: $L('Theme'),
				choices:
				[
					{label:$L('Palm Default'),	value:'palm-default'},
					{label:$L('Palm Dark'),		value:'palm-dark'}
				],
				modelProperty: 'theme'
			},
			this.prefs
		);

		this.controller.listen('theme', Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));

	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

};

PreferencesAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
};
PreferencesAssistant.prototype.themeChanged = function(event)
{
	var deviceTheme = '';
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
		deviceTheme += ' small-device';
	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad' ||
		Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
		deviceTheme += ' no-gesture';
	this.controller.document.body.className = event.value + deviceTheme;
	this.cookie.put(this.prefs);
};

PreferencesAssistant.prototype.iconTap = function(event)
{
	this.controller.stageController.popScene();
};

PreferencesAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
		}
	}
};

PreferencesAssistant.prototype.activate = function(event) {};

PreferencesAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
};

PreferencesAssistant.prototype.cleanup = function(event) {
	this.controller.stopListening(this.iconElement,  Mojo.Event.tap, this.iconTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
