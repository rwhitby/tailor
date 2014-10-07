TailorService.identifier = 'palm://org.webosinternals.tailor.node';

function TailorService(){};

TailorService.status = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'status',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.userId = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'userId',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

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

TailorService.checkMedia = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'checkMedia',
		parameters: {
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.checkExt3fs = function(callback, filesystem)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'checkExt3fs',
		parameters: {
			"filesystem": filesystem,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.repairMedia = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'repairMedia',
		parameters: {
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.repairExt3fs = function(callback, filesystem)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'repairExt3fs',
		parameters: {
			"filesystem": filesystem,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.corruptFilesystem = function(callback, filesystem)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'corruptFilesystem',
		parameters: {
			"filesystem": filesystem,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.resizeMedia = function(callback, size)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'resizeMedia',
		parameters:
		{
			"size": size,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.resizeExt3fs = function(callback, filesystem, size)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'resizeExt3fs',
		parameters:
		{
			"filesystem": filesystem,
			"size": size,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.resizePartition = function(callback, filesystem, size)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'resizePartition',
		parameters:
		{
			"filesystem": filesystem,
			"size": size,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.createPartition = function(callback, partition, size)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'createPartition',
		parameters:
		{
			"partition": partition,
			"size": size,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.deletePartition = function(callback, filesystem, size)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'deletePartition',
		parameters:
		{
			"filesystem": filesystem,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.createMedia = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'createMedia',
		parameters: {
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.createExt3fs = function(callback, filesystem)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'createExt3fs',
		parameters: {
			"filesystem": filesystem,
			"subscribe": true
		},
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.unmountBind = function(callback, directory)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'unmountBind',
		parameters: {
			"directory": directory
		},
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

TailorService.unmountOptware = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'unmountOptware',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.mountOptware = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'mountOptware',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.unmountLuneOS = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'unmountLuneOS',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

TailorService.mountLuneOS = function(callback)
{
    var request = new Mojo.Service.Request(TailorService.identifier,
	{
	    method: 'mountLuneOS',
	    onSuccess: callback,
	    onFailure: callback
	});
    return request;
};

// Local Variables:
// tab-width: 4
// End:
