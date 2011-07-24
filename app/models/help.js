function helpData()
{
}

helpData.get = function(lookup)
{
	if (helpData.lookup[lookup])
	{
		return helpData.lookup[lookup];
	}
	else
	{
		return { title: lookup.replace(/_/g, " ").replace(/-/g, " "), data: 'This section isn\'t configured in the help model. Call a programmer! ('+lookup+')' };
	}
	return false; // this shouldn't happen
}

helpData.lookup = 
{
	'name':
	{
		title: $L('Name'),
		data: $L('asdf')
	},
	
};