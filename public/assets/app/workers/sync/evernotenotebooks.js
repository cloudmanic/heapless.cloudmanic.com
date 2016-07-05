site.sync.EvernoteNotebooks = {}

//
// Get
//
site.sync.EvernoteNotebooks.get = function (callback)
{
	var rt = [];
	
	var con = rest.get('/api/v1/connections?col_ConnectionsType=evernote'); 
		
	for(var i in con.data)
	{ 	
		var url = '/api/v1/connections/evernote/notebooks?ConnectionsId=' + con.data[i].ConnectionsId;
		var rows = rest.get(url);
		
		for(var r in rows.data)
		{
		  rt.push(rows.data[r]);
		}
	}
	
	return { data: rt };
}

//
// Insert
//
site.sync.EvernoteNotebooks.insert = function (data)
{
	console.log(data);
}

//
// Update
//
site.sync.EvernoteNotebooks.update = function (data, id, callback)
{
	var url = '/api/v1/EvernoteNotebooks/update/' + id;
	rest.post(url, data, function (json) { callback(json); });
}

//
// Delete
//
site.sync.EvernoteNotebooks.delete = function (id)
{
	console.log(id);
}