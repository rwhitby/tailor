TailorService.identifier = 'palm://org.webosinternals.tailor';

function TailorService(){};

TailorService.listGroups = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'listGroups',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.listVolumes = function(callback, group)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'listVolumes',
		parameters:
		{
			"group": group
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// Local Variables:
// tab-width: 4
// End:
