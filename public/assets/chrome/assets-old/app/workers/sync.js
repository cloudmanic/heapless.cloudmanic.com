var busy = false;
var listings = {};

self.requestFileSystemSync = self.webkitRequestFileSystemSync || self.requestFileSystemSync;
self.requestFileSystem = self.webkitRequestFileSystem || self.requestFileSystem;

try {
	// 1 GB
  var fs = requestFileSystemSync(TEMPORARY, 1024*1024*1000);
  
  // Functions we call on load.
  update_listings();
	get_files_data();
} catch (e) {
  onError(e);
}

// 
// Store json data for later use. We do this to avoid the 
// browser storage limits.
//
function store_json(json, name)
{
	var fileEntry = fs.root.getFile('/' + name + '.json', { create: true });
	
	try {
		var bb = new Blob([ JSON.stringify(json) ], { type: 'text/json' });
	  fileEntry.createWriter().write(bb);
	} catch (e) {
	  onError(e);
	}		
}

//
// Get stored json.
//
function get_stored_json(name)
{
	var fileEntry = fs.root.getFile('/' + name + '.json', { create: true });
	
	var reader = new FileReader();

	reader.onload = function(e) {
		self.postMessage({ action: 'model', model: 'Files', data: JSON.parse(this.result) });
		return JSON.parse(this.result);
	};

	reader.readAsText(fileEntry.file());
}

//
// Make a hash of all the files we currently have.
//
function update_listings(dirReader)
{
	if(! dirReader)
	{
		var dirEntry = fs.root.getDirectory('/', {});
		var dirReader = dirEntry.createReader();
	}
	
	var entries = dirReader.readEntries();
	
	for(var i = 0; i < entries.length; i++) 
	{
	  var entry = entries[i];
	  
	  if(entry.isDirectory)
	  {
	    console.log('Directory: ' + entry.fullPath);
	  } else
	  {
			listings[entry.fullPath.replace('/', '').trim()] = entry.toURL();
	  }
	}
	
	if(entries.length > 0)
	{
		update_listings(dirReader);
	}
}

//
// Make JSON request.
//
function get_json(url)
{
  try {
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', url, false);
		
		xhr.send();
		
		return JSON.parse(xhr.response);
  } catch(e) {
		console.log('XHR Error ' + e.toString());
  }	
}

// 
// Make Ajax request to get a file.
//
function make_file_request(url) 
{
  try {
    var xhr = new XMLHttpRequest();
    
    // Note: synchronous
    xhr.open('GET', url + '?access_token=d0d1de0eaa960b431cb4373514c7717f72247553&account_id=174', false); 
    
    xhr.responseType = 'arraybuffer';
    
    xhr.send();
    
    return xhr.response;
  } catch(e) {
		console.log('XHR Error ' + e.toString());
  }
}

//
// Generic file catcher.
//
function onError(e) 
{
  console.log('ERROR: ' + e.toString()); // Forward the error to main app.
}

//
// Download files data.
//
function get_files_data()
{
	if(! navigator.onLine)
	{
		console.log('Offline....');
		get_stored_json('Files');
		return false;
	}

	var url = 'http://heapless.cloudmanic.dev/api/v1/files?extra=true&access_token=d0d1de0eaa960b431cb4373514c7717f72247553&account_id=174';
	var data = get_json(url);
	
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
	
	self.postMessage({ action: 'model', model: 'Files', data: data.data });
	
	// Store the json locally to be used offline.
	store_json(data.data, 'Files');
	
	// See if there are any thumbnails or pages we need to download.
	download_thumbnails(data.data);
	download_pages(data.data);
}

//
// Download page images.
//
function download_pages(data)
{
	for(var i in data)
	{	
		// Thumbnails
		for(var p in data[i].Pages)
		{
		  var thumb = 'thumb_' + data[i].Pages[p].OldThumbUrl.split('/').reverse()[0].trim();
		  
		  if(listings[thumb])
		  {
		  	continue;
		  }
		  
			var fileEntry = fs.root.getFile('/' + thumb, { create: true });
			
			try {	
			  var arrayBuffer = make_file_request(data[i].Pages[p].OldThumbUrl);
			  var blob = new Blob([ new Uint8Array(arrayBuffer) ], { type: 'image/jpeg' });
			
			  try {
			    fileEntry.createWriter().write(blob);
			  } catch (e) {
			    onError(e);
			  }	
			  
			} catch (e) {
			  onError(e);
			}
		}
			
		// Pages
		for(var p in data[i].Pages)
		{			
		  var page = data[i].Pages[p].OldUrl.split('/').reverse()[0].trim();
		  
		  if(listings[page])
		  {
		  	continue;
		  }
		  
			var fileEntry = fs.root.getFile('/' + page, { create: true });
			
			try {	
			  var arrayBuffer = make_file_request(data[i].Pages[p].OldUrl);
			  var blob = new Blob([ new Uint8Array(arrayBuffer) ], { type: 'image/jpeg' });
			
			  try {
			    fileEntry.createWriter().write(blob);
			  } catch (e) {
			    onError(e);
			  }	
			  
			} catch (e) {
			  onError(e);
			}			
		}	
	}	
}

//
// Download thumbnail images.
//
function download_thumbnails(data)
{
	for(var i in data)
	{		
	  var base = data[i].OldUrl.split('/').reverse()[0];
	  var id = data[i].OldUrl.split('/').reverse()[1];
		var hash = id + '_' + base;
	  
	  if(listings[hash])
	  {
	  	continue;
	  }
	  		
	  var fileEntry = fs.root.getFile('/' + id + '_' + base, { create: true });
	  
	  try {	
	  	var arrayBuffer = make_file_request(data[i].OldUrl);
	  	var blob = new Blob([ new Uint8Array(arrayBuffer) ], { type: 'image/jpeg' });
	  
	  	try {
	  	  fileEntry.createWriter().write(blob);
	  	} catch (e) {
	  	  onError(e);
	  	}	
	  	
	  } catch (e) {
	    onError(e);
	  }		
	}
}

//
// So we do not make more than one request to the server we just pass in the data to sync this way.
//
self.addEventListener('message', function(e) 
{
	// Get a list of known files.
	if(e.data.action == 'listing')
	{
		self.postMessage({ action: 'listing', data: listings });
	}

	// Sync action
	if(e.data.action == 'sync')
	{	
		if(busy)
		{
			console.log('busy');
			return false;
		} else
		{
			busy = true;
		}
	
		// Models to sync.
		update_listings();
		get_files_data();
		
		busy = false;
	}	
}, false);