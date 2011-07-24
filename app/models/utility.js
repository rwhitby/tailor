// trim function
trim = function(str)
{
	return str.replace(/^\s*/, "").replace(/\s*$/, "");
};

var email = function(subject, message)
{
	
	var request = new Mojo.Service.Request("palm://com.palm.applicationManager",
	{
		method: 'open',
		parameters:
		{
			id: 'com.palm.app.email',
			params:
			{
				'summary':	subject,
				'text':		'<html><body>' + message + '</body></html>'
			}
		}
	});
	return request;
}

// Local Variables:
// tab-width: 4
// End:
