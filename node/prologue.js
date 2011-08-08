// Make it look more node-like
if (typeof require === 'undefined') {
   require = IMPORTS.require;
}

// Enable logging
var logger = require('pmloglib');

var exec  = require('child_process').exec;
var spawn = require('child_process').spawn;
