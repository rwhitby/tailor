// Since Command Assistants are only around for the duration of processing a request, 
// we store more-persistent state in our Service Assistant object so it is available between requests.
function TailorService() {
}

TailorService.prototype = {
	// The setup() function is run when the service starts up
	// If the setup needs to do anything asynchronous, it should return a Future
	setup: function() {
	}
};
