site.sync.Files = {}

//
// Get
//
site.sync.Files.get = function ()
{
	console.log('get');
}

//
// Insert
//
site.sync.Files.insert = function (data)
{
	console.log(data);
}

//
// Update
//
site.sync.Files.update = function (data, id, callback)
{
	var url = 'http://heapless.cloudmanic.dev/api/v1/files/update/' + id;

	// Toast stuff we do not need.
	if(data.Pages)
	{
		delete data.Pages;
	}

	// XHR call.
	rest.post(url, data, function (json) { callback(json); });
}

//
// Delete
//
site.sync.Files.delete = function (id)
{
	console.log(id);
}