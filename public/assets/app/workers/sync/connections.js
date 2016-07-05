site.sync.Connections = {}

//
// Get
//
site.sync.Connections.get = function (callback)
{
	return rest.get('/api/v1/connections');
}

//
// Insert
//
site.sync.Connections.insert = function (data)
{
	console.log(data);
}

//
// Update
//
site.sync.Connections.update = function (data, id, callback)
{
	var url = '/api/v1/connections/update/' + id;
	rest.post(url, data, function (json) { callback(json); });
}

//
// Delete
//
site.sync.Connections.delete = function (id)
{
	console.log(id);
}