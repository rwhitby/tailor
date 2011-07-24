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

TailorService.listMounts = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'listMounts',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.unmountMedia = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'unmountMedia',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.mountMedia = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'mountMedia',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.unmountExt3fs = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'unmountExt3fs',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.mountExt3fs = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'mountExt3fs',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// Local Variables:
// tab-width: 4
// End:
