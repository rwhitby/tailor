var prefs = new preferenceCookie();
var vers =  new versionCookie();

// stage names
var mainStageName = 'tailor-main';

function AppAssistant() {}

AppAssistant.prototype.handleLaunch = function(params)
{
	var mainStageController = this.controller.getStageController(mainStageName);
	
	try {
		// launch from launcher tap
		if (!params) {
	        if (mainStageController) {
				mainStageController.popScenesTo('main');
				mainStageController.activate();
			}
			else {
				this.controller.createStageWithCallback({name: mainStageName, lightweight: true},
														this.launchFirstScene.bind(this));
			}
		}
	}
	catch (e) {
		Mojo.Log.logException(e, "AppAssistant#handleLaunch");
	}
};

AppAssistant.prototype.launchFirstScene = function(controller)
{
    vers.init();
    if (vers.showStartupScene()) {
		controller.pushScene('startup');
    }
    else {
		controller.pushScene('main');
	}
};

AppAssistant.prototype.cleanup = function(event)
{
};

// Local Variables:
// tab-width: 4
// End:
