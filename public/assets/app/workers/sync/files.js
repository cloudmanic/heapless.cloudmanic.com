site.sync.Files = {}

//
// Get
//
site.sync.Files.get = function ()
{
	var data = rest.get('/api/v1/files?extra=true');
	
	// Go through the data and see if we have local files.
	for(var i in data.data)
	{
		// Deal with thumbnails
		var base = data.data[i].ThumbUrl.split('/').reverse()[0];
		var id = data.data[i].ThumbUrl.split('/').reverse()[1];
		var hash = id + '_' + base;
		
		data.data[i].OldUrl = data.data[i].ThumbUrl;
		
		if(listings[hash])
		{
		  data.data[i].ThumbUrl = listings[hash];
		}
		
		// Deal with page thumbs.
		for(var p in data.data[i].Pages)
		{
			var thumb = 'thumb_' + data.data[i].Pages[p].ThumbUrl.split('/').reverse()[0].trim();
				
			data.data[i].Pages[p].OldThumbUrl = data.data[i].Pages[p].ThumbUrl;
			
			if(listings[thumb])
			{
			  data.data[i].Pages[p].ThumbUrl = listings[thumb];
			}			
		}
		
		// Deal with pages.
		for(var p in data.data[i].Pages)
		{
			var page = data.data[i].Pages[p].Url.split('/').reverse()[0].trim();
				
			data.data[i].Pages[p].OldUrl = data.data[i].Pages[p].Url;
			
			if(listings[page])
			{
			  data.data[i].Pages[p].Url = listings[page];
			}			
		}										
	}
	
	return data;
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
	var url = '/api/v1/files/update/' + id;

	// Toast stuff we do not need.
	if(data.Pages)
	{
		delete data.Pages;
	}

	// XHR call.
	return rest.post(url, data);
}

//
// Delete
//
site.sync.Files.delete = function (id)
{
	console.log(id);
}